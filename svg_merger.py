#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import sys
from pathlib import Path
from collections import defaultdict
import numpy as np
import re
import svgpathtools as svgpt
from shapely.geometry import Polygon, MultiPolygon
from shapely.ops import unary_union


def extract_points_from_path(path_data):
    """
    SVG 경로 데이터에서 좌표점을 추출합니다.

    Args:
        path_data (str): SVG path 데이터 문자열

    Returns:
        List[Tuple[float, float]]: 좌표점 목록
    """
    try:
        # svgpathtools를 사용하여 경로 파싱
        path = svgpt.parse_path(path_data)

        # 경로가 비어있는 경우
        if not path:
            return []

        # 경로에서 좌표 추출
        points = []
        for segment in path:
            # 세그먼트 시작점 추가
            start = segment.start
            points.append((start.real, start.imag))

            # 세그먼트가 Line이 아닌 경우 중간점 샘플링을 증가
            if not isinstance(segment, svgpt.Line):
                # 복잡한 곡선 세그먼트의 경우 샘플링
                num_samples = 20  # 샘플링할 점 개수
                t_vals = np.linspace(0, 1, num_samples)[1:-1]  # 샘플링 구간
                for t in t_vals:
                    point = segment.point(t)
                    points.append((point.real, point.imag))

            # 마지막 세그먼트의 끝점 추가
            if segment == path[-1]:
                end = segment.end
                points.append((end.real, end.imag))

        return points
    except Exception as e:
        print(f"경로 파싱 오류: {e}")
        # 대체 방법: 정규식을 사용하여 좌표 추출을 개선
        try:
            # 경로 명령어와 좌표 추출
            commands = re.findall(r'([MmLlHhVvCcSsQqTtAaZz])', path_data)
            params = re.split(r'[MmLlHhVvCcSsQqTtAaZz]', path_data)[1:]

            # 명령어 개수와 파라미터 개수가 일치하지 않으면 오류
            if len(commands) != len(params):
                return []

            points = []
            current_x, current_y = 0, 0

            for cmd, param in zip(commands, params):
                # 공백과 쉼표로 구분된 좌표를 추출
                param = param.strip()
                if not param:
                    continue

                coords = re.findall(r'[-+]?[0-9]*\.?[0-9]+', param)
                coords = [float(c) for c in coords]

                if cmd in 'Mm':  # 이동 명령어
                    if len(coords) >= 2:
                        if cmd == 'm' and points:  # 상대 이동
                            current_x += coords[0]
                            current_y += coords[1]
                        else:  # 절대 이동
                            current_x, current_y = coords[0], coords[1]
                        points.append((current_x, current_y))

                        # 이후의 좌표도 처리 (다중 이동 명령)
                        for i in range(2, len(coords), 2):
                            if i+1 < len(coords):
                                if cmd == 'm':  # 상대 이동
                                    current_x += coords[i]
                                    current_y += coords[i+1]
                                else:  # 절대 이동
                                    current_x, current_y = coords[i], coords[i+1]
                                points.append((current_x, current_y))

                elif cmd in 'Ll':  # 선 명령어
                    for i in range(0, len(coords), 2):
                        if i+1 < len(coords):
                            if cmd == 'l':  # 상대 이동
                                current_x += coords[i]
                                current_y += coords[i+1]
                            else:  # 절대 이동
                                current_x, current_y = coords[i], coords[i+1]
                            points.append((current_x, current_y))

                elif cmd in 'Hh':  # 수평선
                    for val in coords:
                        if cmd == 'h':  # 상대 이동
                            current_x += val
                        else:  # 절대 이동
                            current_x = val
                        points.append((current_x, current_y))

                elif cmd in 'Vv':  # 수직선
                    for val in coords:
                        if cmd == 'v':  # 상대 이동
                            current_y += val
                        else:  # 절대 이동
                            current_y = val
                        points.append((current_x, current_y))

            return points
        except Exception as e:
            print(f"정규식 파싱 오류: {e}")
            return []


def create_polygon_from_path(d):
    """
    SVG 경로 데이터로부터 Shapely Polygon 객체를 생성합니다.

    Args:
        d (str): SVG path 데이터 문자열

    Returns:
        Polygon 또는 None: 생성된 Polygon 객체 또는 생성 실패 시 None
    """
    points = extract_points_from_path(d)

    # 추출된 점이 충분하지 않으면 None 반환
    if len(points) < 3:
        print(f"경고: 경로에서 추출된 점이 부족합니다 ({len(points)}개)")
        return None

    try:
        # 폴리곤을 생성하기 전에 점들이 시계 방향으로 정렬되어 있는지 확인
        # Shapely는 외부 경계는 시계 방향, 내부 구멍은 반시계 방향으로 정의함
        # 복잡한 경로를 더 정확하게 처리하기 위해 SimplifyPreserveTopology 사용
        polygon = Polygon(points)

        # 유효하지 않은 폴리곤인 경우
        if not polygon.is_valid:
            print("경고: 유효하지 않은 폴리곤이 생성되었습니다. 자체 교차를 제거합니다.")
            # buffer(0) 연산은 자체 교차 제거에 도움이 되지만,
            # 복잡한 케이스에서는 문제가 될 수 있음
            # 따라서 더 작은 buffer 값을 사용하여 정밀도 유지
            polygon = polygon.buffer(0.0001).buffer(-0.0001)

            # 여전히 유효하지 않으면 다시 시도
            if not polygon.is_valid:
                polygon = polygon.buffer(0)  # 마지막 시도

        return polygon
    except Exception as e:
        print(f"폴리곤 생성 오류: {e}")
        return None


def convert_shapely_to_svg_path(shape):
    """
    Shapely 객체(Polygon 또는 MultiPolygon)를 SVG 경로 데이터로 변환합니다.
    내부 구멍(내수면, 호수 등)을 올바르게 처리합니다.

    Args:
        shape (Polygon 또는 MultiPolygon): Shapely 객체

    Returns:
        str: SVG path 데이터 문자열
    """
    if shape is None:
        return ""

    svg_path_data = ""

    # MultiPolygon인 경우 각 Polygon을 개별적으로 처리
    if isinstance(shape, MultiPolygon):
        polygons = list(shape.geoms)
    else:
        polygons = [shape]

    for polygon in polygons:
        # 외곽 경계 처리
        exterior_coords = list(polygon.exterior.coords)
        if len(exterior_coords) < 3:
            continue

        # 경로 시작
        x, y = exterior_coords[0]
        path_str = f"M {x},{y} "

        # 나머지 점들에 대한 라인 추가
        for x, y in exterior_coords[1:]:
            path_str += f"L {x},{y} "

        # 경로 닫기
        path_str += "Z "

        # 내부 구멍 처리 (시화호와 같은 내수면)
        for interior in polygon.interiors:
            coords = list(interior.coords)
            if len(coords) < 3:
                continue

            x, y = coords[0]
            path_str += f"M {x},{y} "

            for x, y in coords[1:]:
                path_str += f"L {x},{y} "

            path_str += "Z "

        svg_path_data += path_str

    return svg_path_data


def extract_city_name(path_id):
    """
    경로 ID에서 도시 이름을 추출합니다.
    예: "수원시 팔달구" -> "수원시"

    특수 케이스를 처리하여 안산시와 같은 복잡한 경우에도 올바르게 동작합니다.

    Args:
        path_id (str): 경로 ID

    Returns:
        str: 추출된 도시 이름
    """
    if not path_id:
        return ""

    # 특수 케이스 처리를 위한 매핑 테이블
    special_cases = {
        "안산시 단원구": "안산시",
        "안산시 상록구": "안산시",
        # 필요에 따라 다른 특수 케이스 추가
    }

    # 매핑 테이블에 있는 경우 바로 반환
    if path_id in special_cases:
        return special_cases[path_id]

    # 경기도 내 "구"가 있는 시의 목록
    cities_with_gu = [
        "수원시", "성남시", "고양시", "용인시", "부천시", "안산시",
        "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시"
    ]

    # 공백으로 구분된 단어 분석
    parts = path_id.split()
    if not parts:
        return path_id

    # 도시 이름 후보 추출
    city_candidate = parts[0]

    # "시"로 끝나는 첫 번째 단어가 있는 경우
    if city_candidate.endswith("시"):
        # 특수 케이스: "구"가 있는 시이면서 2번째 단어가 "구"로 끝나는 경우
        if (city_candidate in cities_with_gu and len(parts) > 1 and
                parts[1].endswith("구")):
            return city_candidate

    # 일반적인 경우: 첫 번째 단어 반환
    return city_candidate


def group_and_merge_paths(input_file, output_file, preserve_originals=True):
    """
    SVG 파일에서 공백으로 구분된 두 단어로 된 ID를 가진 path들을
    첫 번째 단어를 기준으로 그룹화하여 병합합니다.

    예: "수원시 팔달구", "수원시 영통구" -> "수원시"로 병합

    Args:
        input_file (str): 입력 SVG 파일 경로
        output_file (str): 출력 SVG 파일 경로
        preserve_originals (bool): 원본 path 요소를 유지할지 여부
    """
    # SVG 네임스페이스 설정
    ET.register_namespace("", "http://www.w3.org/2000/svg")

    # SVG 파일 파싱
    tree = ET.parse(input_file)
    root = tree.getroot()

    # 네임스페이스 추출
    ns = {"svg": "http://www.w3.org/2000/svg"}

    # 모든 path 요소 찾기
    all_paths = root.findall(".//svg:path", ns)
    print(f"전체 path 개수: {len(all_paths)}")

    # 병합에서 제외할 지역 목록
    excluded_regions = ["안산시"]
    print(f"병합에서 제외되는 지역: {', '.join(excluded_regions)}")

    # 공백으로 구분된 ID를 가진 path들을 그룹화
    path_groups = defaultdict(list)
    ungrouped_paths = []

    for path in all_paths:
        path_id = path.get('id', '')
        # ID에서 도시 이름 추출 (첫 번째 단어)
        city_name = extract_city_name(path_id)

        if city_name and city_name != path_id:
            # 도시 이름으로 그룹화 (안산시는 제외)
            path_groups[city_name].append(path)
        else:
            ungrouped_paths.append(path)

    print(f"그룹화된 path 수: {sum(len(paths) for paths in path_groups.values())}")
    print(f"그룹화되지 않은 path 수: {len(ungrouped_paths)}")

    # 모든 경로의 원본 스타일 속성을 보존하기 위한 속성 저장
    style_attributes = {}

    # 그룹별로 병합 수행
    for group_key, paths in path_groups.items():
        if len(paths) <= 1:
            # 그룹에 path가 하나뿐이면 병합 불필요
            continue

        # 안산시는 병합하지 않고 건너뜀
        if group_key in excluded_regions:
            print(f"'{group_key}'는 병합에서 제외됩니다.")
            continue

        print(f"'{group_key}' 그룹의 {len(paths)}개 path 병합 중...")

        # 복잡한 경계 처리를 위해 원본 path 데이터 저장
        path_data_list = []
        path_styles = {}

        # 원본 path에서 데이터와 스타일 속성 추출
        for i, path in enumerate(paths):
            path_id = path.get('id', '')
            path_data = path.get('d', '')

            if not path_data:
                continue

            path_data_list.append((path_id, path_data))

            # 첫 번째 path의 스타일 속성을 기본값으로 사용
            if i == 0:
                for key, value in path.attrib.items():
                    if key != 'd' and key != 'id':
                        path_styles[key] = value

        # 스타일 속성 저장
        style_attributes[group_key] = path_styles

        # 시화호와 같은 내수면이 있는 지역 목록
        regions_with_inland_water = ["안산시"]

        # Shapely 라이브러리로 경로 병합
        polygons = []
        inland_water_polygons = []

        for path_id, path_data in path_data_list:
            polygon = create_polygon_from_path(path_data)
            if polygon:
                # 안산시와 같은 복잡한 케이스를 위한 특별 처리
                if group_key in regions_with_inland_water and polygon.is_valid:
                    # 내수면(시화호) 추출을 위한 정밀도 향상 처리
                    processed_polygon = polygon.buffer(0.0001).buffer(-0.0001)

                    # 내수면과 육지 구분
                    if ("바다" in path_id.lower() or
                        "호수" in path_id.lower() or
                        "시화" in path_id.lower()):
                        inland_water_polygons.append(processed_polygon)
                        continue  # 내수면은 일반 폴리곤에 추가하지 않음

                    polygon = processed_polygon

                polygons.append(polygon)

        if not polygons:
            print(f"경고: '{group_key}' 그룹에서 유효한 폴리곤이 없습니다.")
            continue

        print(f"  - {len(polygons)}개의 유효한 폴리곤 생성됨")
        if inland_water_polygons:
            print(f"  - {len(inland_water_polygons)}개의 내수면 폴리곤 발견됨")

        # 유효하지 않은 폴리곤 필터링
        valid_polygons = [p for p in polygons if p.is_valid]
        if len(valid_polygons) != len(polygons):
            print(f"  - {len(polygons) - len(valid_polygons)}개의 "
                  f"유효하지 않은 폴리곤 제외됨")
            polygons = valid_polygons

        # 모든 폴리곤을 병합하여 내부 경계선 제거
        try:
            # unary_union 연산으로 병합
            merged_shape = unary_union(polygons)
            print("  - 폴리곤 병합 완료 (내부 경계선 제거)")

            # 내수면 폴리곤이 있는 특수 지역 처리
            if (group_key in regions_with_inland_water and
                inland_water_polygons):
                print("  - 시화호와 같은 내수면 처리 중...")
                # 내수면 폴리곤들 병합
                inland_water_shape = unary_union(inland_water_polygons)

                # 내수면과 겹치는 부분 차집합 연산
                if inland_water_shape.is_valid and merged_shape.is_valid:
                    try:
                        # 내수면과 도시 경계 사이의 차집합 연산 (구멍 생성)
                        merged_shape = merged_shape.difference(
                            inland_water_shape)
                        print("  - 내수면 제외 처리 완료")
                    except Exception as e:
                        print(f"  - 내수면 처리 중 오류 발생: {e}")

            # 병합 결과가 유효한지 확인
            if not merged_shape.is_valid:
                print("  - 병합된 폴리곤이 유효하지 않아 수정 중...")
                merged_shape = merged_shape.buffer(0)

            # 병합된 폴리곤을 SVG 경로 데이터로 변환
            merged_path_data = convert_shapely_to_svg_path(merged_shape)

            if not merged_path_data:
                print(f"경고: '{group_key}' 그룹의 병합된 경로 데이터가 비어 있습니다.")
                continue

            # 새로운 path 요소 생성
            merged_path = ET.Element("{http://www.w3.org/2000/svg}path")

            # 저장된 스타일 속성 적용
            for key, value in style_attributes[group_key].items():
                merged_path.set(key, value)

            # fill-rule 속성 추가 (중첩된 영역 처리를 위해)
            merged_path.set('fill-rule', 'evenodd')

            # 새 ID 설정
            merged_path.set('id', group_key)

            # 병합된 경로 데이터 설정
            merged_path.set('d', merged_path_data)

            # 부모 요소 찾기 (첫 번째 path의 부모)
            parent = None
            for path in paths:
                xpath = f".//svg:path[@id='{path.get('id')}']/.."
                parent = root.find(xpath, ns)
                if parent is not None:
                    break

            # SVG의 경로 그룹 찾기
            path_group = root.find('.//svg:g', ns)

            # 새 path 요소 추가
            if parent is not None:
                parent.append(merged_path)
            elif path_group is not None:
                # 부모를 찾을 수 없는 경우 g 요소에 추가
                path_group.append(merged_path)
            else:
                # g 요소도 없는 경우 root에 직접 추가
                root.append(merged_path)

            # 원래 path 요소 제거 여부 결정
            if not preserve_originals:
                for path in paths:
                    path_parent = None
                    xpath = f".//svg:path[@id='{path.get('id')}']/.."
                    path_parent = root.find(xpath, ns)

                    if path_parent is not None:
                        path_parent.remove(path)
                    else:
                        print(f"경고: ID '{path.get('id')}'의 부모를 찾을 수 없습니다.")

        except Exception as e:
            print(f"오류: '{group_key}' 그룹의 폴리곤 병합 중 오류 발생: {e}")
            continue

    # 수정된 SVG 저장
    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    print(f"성공: '{output_file}'에 SVG를 저장했습니다.")
    return True


def main():
    """
    명령줄에서 실행할 때의 메인 함수
    사용법: python svg_merger.py input.svg output.svg [--remove-originals]
    """
    preserve_originals = True

    if len(sys.argv) < 3:
        print("사용법: python svg_merger.py input.svg output.svg"
              " [--remove-originals]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    if len(sys.argv) > 3 and sys.argv[3] == "--remove-originals":
        preserve_originals = False

    if not Path(input_file).exists():
        print(f"오류: 입력 파일 '{input_file}'이 존재하지 않습니다.")
        sys.exit(1)

    # 필요한 라이브러리 확인
    required_libs = ['svgpathtools', 'shapely', 'numpy']
    missing_libs = []

    for lib in required_libs:
        try:
            __import__(lib)
        except ImportError:
            missing_libs.append(lib)

    if missing_libs:
        print("경고: 다음 라이브러리를 설치해야 합니다:")
        print("  pip install " + ' '.join(missing_libs))
        print("계속 진행하시겠습니까? (y/n)")
        response = input()
        if response.lower() != 'y':
            print("프로그램을 종료합니다.")
            sys.exit(1)

    success = group_and_merge_paths(
        input_file, output_file, preserve_originals
    )
    if success:
        msg = "성공: 지역 영역들을 병합했습니다."
        if preserve_originals:
            msg += " (원본 path 요소 유지)"
        else:
            msg += " (원본 path 요소 제거)"
        print(msg)
    else:
        print("오류: SVG 병합 과정에서 문제가 발생했습니다.")


if __name__ == "__main__":
    main()
