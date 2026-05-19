import { Card, CardContent } from "@/components/ui/card";
import { formatVND } from "@/lib/format";
import { Package, Calendar, CalendarDays, TrendingUp } from "lucide-react";

interface StatsRowProps {
  totalProducts: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

export default function StatsRow({ totalProducts, todayRevenue, weekRevenue, monthRevenue }: StatsRowProps) {
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
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Doanh thu hôm nay</p>
            <h3 className="text-2xl font-serif font-semibold">{formatVND(todayRevenue)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-violet-500/10 text-violet-600 rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Doanh thu tuần</p>
            <h3 className="text-2xl font-serif font-semibold">{formatVND(weekRevenue)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Doanh thu tháng</p>
            <h3 className="text-2xl font-serif font-semibold">{formatVND(monthRevenue)}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
