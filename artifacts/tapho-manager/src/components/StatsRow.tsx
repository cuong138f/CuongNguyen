import { Card, CardContent } from "@/components/ui/card";
import { formatVND } from "@/lib/format";
import { Package, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface StatsRowProps {
  totalProducts: number;
  totalValue: number;
  avgPrice: number;
  lowStockCount: number;
}

export default function StatsRow({ totalProducts, totalValue, avgPrice, lowStockCount }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tổng mặt hàng</p>
            <h3 className="text-2xl font-serif font-semibold">{totalProducts}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tổng giá trị kho</p>
            <h3 className="text-2xl font-serif font-semibold">{formatVND(totalValue)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Giá trung bình</p>
            <h3 className="text-2xl font-serif font-semibold">{formatVND(avgPrice)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sắp hết hàng</p>
            <h3 className="text-2xl font-serif font-semibold">{lowStockCount}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
