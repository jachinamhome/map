const RegionMapSortBar = ({
  sortType,
  sortOrder,
  handleSort,
  selectedAreas,
  filteredVideosLength
}) => (
  <div className="sticky top-0 bg-white p-4 shadow-sm z-30">
    <div className="flex justify-between items-center max-w-[1024px] mx-auto">
      <h3 className="text-lg font-bold">
        {selectedAreas.length > 0 ? `${selectedAreas.join(', ')}` : '전체'}
        <span className="text-gray-500 text-base ml-2">
          {filteredVideosLength}개의 집을 찾았어요
        </span>
      </h3>
      <div className="flex gap-2">
        <button
          onClick={() => handleSort('date')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            sortType === 'date'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          날짜순 {sortType === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => handleSort('price')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            sortType === 'price'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          금액순 {sortType === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => handleSort('size')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            sortType === 'size'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          면적순 {sortType === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>
    </div>
  </div>
);

export default RegionMapSortBar;