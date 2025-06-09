'use client';

import { useState } from 'react';

const regions = [
  '전체',
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도'
];

const contractTypes = ['전체', '월세', '전세', '매매'];
const propertyTypes = ['전체', '원룸', '빌라/투룸+', '오피스텔', '아파트'];
const priceRanges = ['전체', '~30만원', '30~50만원', '50~70만원', '70~100만원', '100만원~'];

export default function FilterPanel({ filters, onFilterChange }) {
  const [activeFilter, setActiveFilter] = useState(null);

  const handleFilterSelect = (filterType, value) => {
    onFilterChange({ [filterType]: value });
    setActiveFilter(null);
  };

  const toggleFilter = (filterType) => {
    if (activeFilter === filterType) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterType);
    }
  };

  // 드롭다운 외부 클릭 시 닫기
  const handleClickOutside = () => {
    if (activeFilter) {
      setActiveFilter(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
            <button
              className={`w-full flex justify-between items-center px-3 py-2 border ${activeFilter === 'region' ? 'border-blue-500' : 'border-gray-300'} rounded-md text-sm`}
              onClick={() => toggleFilter('region')}
            >
              <span>{filters.region}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${activeFilter === 'region' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeFilter === 'region' && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {regions.map((region) => (
                  <button
                    key={region}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filters.region === region ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => handleFilterSelect('region', region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">계약 유형</label>
            <button
              className={`w-full flex justify-between items-center px-3 py-2 border ${activeFilter === 'contractType' ? 'border-blue-500' : 'border-gray-300'} rounded-md text-sm`}
              onClick={() => toggleFilter('contractType')}
            >
              <span>{filters.contractType}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${activeFilter === 'contractType' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeFilter === 'contractType' && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {contractTypes.map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filters.contractType === type ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => handleFilterSelect('contractType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">방 종류</label>
            <button
              className={`w-full flex justify-between items-center px-3 py-2 border ${activeFilter === 'propertyType' ? 'border-blue-500' : 'border-gray-300'} rounded-md text-sm`}
              onClick={() => toggleFilter('propertyType')}
            >
              <span>{filters.propertyType}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${activeFilter === 'propertyType' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeFilter === 'propertyType' && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filters.propertyType === type ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => handleFilterSelect('propertyType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">가격대</label>
            <button
              className={`w-full flex justify-between items-center px-3 py-2 border ${activeFilter === 'priceRange' ? 'border-blue-500' : 'border-gray-300'} rounded-md text-sm`}
              onClick={() => toggleFilter('priceRange')}
            >
              <span>{filters.priceRange || '전체'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${activeFilter === 'priceRange' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeFilter === 'priceRange' && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {priceRanges.map((range) => (
                  <button
                    key={range}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filters.priceRange === range ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => handleFilterSelect('priceRange', range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="self-end ml-auto">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium transition-colors hover:bg-blue-700 flex items-center"
              onClick={() => onFilterChange({ region: '전체', contractType: '전체', propertyType: '전체', priceRange: '전체' })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}