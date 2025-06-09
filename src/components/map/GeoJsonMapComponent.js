'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function GeoJsonMapComponent({ onRegionSelect }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const geoJsonLayerRef = useRef(null);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // GeoJSON 데이터 가져오기
    const fetchGeoData = async () => {
      try {
        const response = await fetch('/api/geo-data');
        if (!response.ok) {
          throw new Error('GeoJSON 데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('GeoJSON 데이터 로딩 오류:', error);
      }
    };

    fetchGeoData();
  }, []);

  // 지역 스타일 설정
  const getRegionStyle = (feature) => {
    const isSelected = selectedRegion && selectedRegion.code === feature.properties.code;

    return {
      fillColor: isSelected ? '#3b82f6' : '#93c5fd',
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: isSelected ? 0.7 : 0.5,
    };
  };

  // 각 지역에 이벤트 핸들러 추가
  const onEachFeature = (feature, layer) => {
    const regionName = feature.properties.name;
    const regionCode = feature.properties.code;

    // 팝업 설정
    layer.bindTooltip(regionName, {
      permanent: false,
      direction: 'center',
      className: 'region-tooltip'
    });

    // 이벤트 핸들러
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.7,
          weight: 2
        });
      },
      mouseout: (e) => {
        if (selectedRegion && selectedRegion.code === regionCode) return;
        geoJsonLayerRef.current.resetStyle(e.target);
      },
      click: (e) => {
        const region = {
          name: regionName,
          code: regionCode,
          properties: feature.properties
        };

        setSelectedRegion(region);

        if (onRegionSelect) {
          onRegionSelect(region);
        }
      }
    });
  };

  if (!geoData) {
    return <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-lg">지도 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="w-full h-[600px] relative rounded-lg overflow-hidden">
      <MapContainer
        center={[35.95, 127.7]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={getRegionStyle}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}
          />
        )}
      </MapContainer>
    </div>
  );
}