import React, { useState } from "react";
import { useGetRevenueStats, useListSales, useDeleteSale, getListSalesQueryKey, getGetRevenueStatsQueryKey, Sale } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { TrendingUp, Calendar, CalendarDays, Infinity as InfinityIcon, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function SaleRow({ sale }: { sale: Sale }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteSale = useDeleteSale();

  const handleDelete = () => {
    deleteSale.mutate(
      { id: sale.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRevenueStatsQueryKey() });
          toast({ title: "Đã xóa đơn bán" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa đơn bán." });
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {sale.items.length} mặt hàng
              {sale.note && <span className="text-muted-foreground font-normal"> — {sale.note}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-serif font-semibold text-primary">{formatVND(sale.totalAmount)}</span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-border/50 px-4 py-3 bg-secondary/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left pb-2 font-medium">Sản phẩm</th>
                <th className="text-center pb-2 font-medium w-16">SL</th>
                <th className="text-right pb-2 font-medium">Đơn giá</th>
                <th className="text-right pb-2 font-medium">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {sale.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 pr-2">{item.productName}</td>
                  <td className="py-1.5 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{formatVND(item.unitPrice)}</td>
                  <td className="py-1.5 text-right font-medium">{formatVND(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-2 text-sm font-medium text-right text-muted-foreground">Tổng cộng</td>
                <td className="pt-2 text-right font-serif font-bold text-primary">{formatVND(sale.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-3 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1.5 h-7 text-xs">
                  <Trash2 className="w-3 h-3" /> Xóa đơn này
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa đơn bán này?</AlertDialogTitle>
                  <AlertDialogDescription>Thao tác này không thể hoàn tác. Doanh thu sẽ được cập nhật lại.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RevenuePage() {
  const { data: stats, isLoading: isLoadingStats } = useGetRevenueStats();
  const { data: salesList, isLoading: isLoadingSales } = useListSales();

  const statCards = stats
    ? [
        { label: "Hôm nay", amount: stats.today, count: stats.todayCount, icon: Calendar, color: "text-blue-600", bg: "bg-blue-500/10" },
        { label: "Tuần này", amount: stats.thisWeek, count: stats.thisWeekCount, icon: CalendarDays, color: "text-violet-600", bg: "bg-violet-500/10" },
        { label: "Tháng này", amount: stats.thisMonth, count: stats.thisMonthCount, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        { label: "Tất cả", amount: stats.allTime, count: stats.allTimeCount, icon: InfinityIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="container mx-auto px-4 py-8">
        {/* Revenue stats */}
        {isLoadingStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map(({ label, amount, count, icon: Icon, color, bg }) => (
              <Card key={label} className="shadow-sm border-transparent bg-white/70 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 ${bg} ${color} rounded-xl shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-xl font-serif font-bold truncate">{formatVND(amount)}</p>
                    <p className="text-xs text-muted-foreground">{count} đơn</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sales list */}
        <h2 className="text-base font-serif font-semibold mb-4 text-foreground/80">Lịch sử bán hàng</h2>

        {isLoadingSales ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : salesList && salesList.length > 0 ? (
          <div className="space-y-2">
            {salesList.map((sale) => (
              <SaleRow key={sale.id} sale={sale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 rounded-2xl border border-dashed border-muted">
            <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Chưa có đơn bán nào. Hãy thử tab <strong>Bán hàng</strong>.</p>
          </div>
        )}
      </main>
    </div>
  );
}
