'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet 기본 아이콘 문제 해결
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// 선택된 지역 스타일
const selectedStyle = {
  weight: 3,
  color: '#1d4ed8',
  fillColor: '#3b82f6',
  fillOpacity: 0.4,
};

// 기본 지역 스타일
const defaultStyle = {
  weight: 1,
  color: '#666',
  fillColor: '#ddd',
  fillOpacity: 0.2,
};

export default function MapComponent({ geoJsonData, onRegionSelect }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const geoJsonLayerRef = useRef(null);

  // GeoJSON 레이어 이벤트 핸들러
  const onEachFeature = (feature, layer) => {
    const regionName = feature.properties.name || feature.properties.SIG_KOR_NM || '알 수 없는 지역';

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#666',
          fillOpacity: 0.3,
        });
        layer.bindTooltip(regionName).openTooltip();
      },
      mouseout: (e) => {
        if (selectedRegion !== feature.properties.code) {
          geoJsonLayerRef.current.resetStyle(e.target);
        }
      },
      click: (e) => {
        const regionCode = feature.properties.code || feature.properties.SIG_CD;
        setSelectedRegion(regionCode);

        // 모든 레이어를 기본 스타일로 리셋
        geoJsonLayerRef.current.eachLayer((layer) => {
          geoJsonLayerRef.current.resetStyle(layer);
        });

        // 선택된 레이어 스타일 변경
        e.target.setStyle(selectedStyle);

        // 부모 컴포넌트에 선택된 지역 정보 전달
        onRegionSelect && onRegionSelect({
          code: regionCode,
          name: regionName,
          properties: feature.properties
        });
      }
    });
  };

  // 맵 중앙 위치 설정 (대한민국 중심)
  const center = [36.5, 120.5];
  const zoom = 7;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={defaultStyle}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}
          />
        )}
      </MapContainer>
    </div>
  );
}
