'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegionInfo({ region }) {
  if (!region) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>지역 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">지도에서 지역을 선택해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{region.name} 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-muted-foreground">지역 코드:</div>
            <div>{region.code}</div>
          </div>

          {Object.entries(region.properties).map(([key, value]) => {
            // 이미 표시된 name과 code는 제외
            if (key === 'name' || key === 'code') return null;

            return (
              <div key={key} className="grid grid-cols-2 gap-1">
                <div className="text-muted-foreground">{key}:</div>
                <div>{value}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
