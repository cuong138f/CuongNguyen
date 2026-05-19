import React, { useState } from "react";
import { Product } from "@workspace/api-client-react";
import { useListProducts, useCreateSale, getListSalesQueryKey, getGetRevenueStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, ShoppingCart, Trash2, Minus, Plus, CheckCircle, Camera } from "lucide-react";
import { formatVND } from "@/lib/format";
import CameraScanner from "@/components/CameraScanner";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SalePage() {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { data: products, isLoading } = useListProducts();
  const createSale = useCreateSale();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleScanDetected = (items: { productId: number; quantity: number }[]) => {
    setCart((prev) => {
      const next = { ...prev };
      items.forEach(({ productId, quantity }) => {
        next[productId] = (next[productId] ?? 0) + quantity;
      });
      return next;
    });
    toast({ title: `Đã thêm ${items.length} sản phẩm vào đơn` });
  };

  const setQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setCart((prev) => ({ ...prev, [productId]: qty }));
    }
  };

  const cartItems: CartItem[] = (products ?? [])
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ product: p, quantity: cart[p.id] }));

  const total = cartItems.reduce((acc, { product, quantity }) => acc + product.price * quantity, 0);

  const handleConfirm = () => {
    if (cartItems.length === 0) return;
    createSale.mutate(
      {
        data: {
          note: note.trim() || undefined,
          items: cartItems.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            quantity,
          })),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRevenueStatsQueryKey() });
          setCart({});
          setNote("");
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 2500);
          toast({ title: "Đã ghi nhận đơn bán", description: `Tổng thu: ${formatVND(total)}` });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu đơn bán." });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-48">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-serif font-semibold text-foreground/80">Chọn mặt hàng và số lượng bán</h2>
          <Button
            type="button"
            onClick={() => setShowScanner(true)}
            className="gap-2 rounded-full shrink-0"
            variant="outline"
          >
            <Camera className="w-4 h-4" />
            Quét ảnh
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(products ?? []).map((product) => {
              const qty = cart[product.id] ?? 0;
              const active = qty > 0;
              return (
                <Card
                  key={product.id}
                  className={`overflow-hidden transition-all duration-200 border-2 ${
                    active ? "border-primary shadow-md shadow-primary/10" : "border-transparent shadow-sm"
                  } bg-white`}
                >
                  <div className="aspect-square w-full bg-secondary/40 flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground/25" />
                    )}
                    {active && (
                      <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                        {qty}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm line-clamp-1 mb-0.5" title={product.name}>{product.name}</p>
                    <p className="text-primary text-sm font-semibold mb-2">{formatVND(product.price)}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={qty === 0 ? "" : qty}
                        placeholder="0"
                        onChange={(e) => setQty(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="flex-1 text-center h-7 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 min-w-0"
                      />
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Sticky cart bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-xl z-30">
        <div className="container mx-auto px-4 py-3">
          {cartItems.length > 0 ? (
            <>
              {/* Cart items summary */}
              <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80 flex-1 truncate pr-2">{product.name}</span>
                    <span className="text-muted-foreground mr-2">x{quantity}</span>
                    <span className="font-medium text-primary whitespace-nowrap">{formatVND(product.price * quantity)}</span>
                    <button onClick={() => setQty(product.id, 0)} className="ml-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Ghi chú (tùy chọn)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="flex-1 h-9 text-sm"
                />
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Tổng cộng</p>
                    <p className="text-lg font-serif font-bold text-primary">{formatVND(total)}</p>
                  </div>
                  <Button
                    onClick={handleConfirm}
                    disabled={createSale.isPending || submitted}
                    className="gap-2 rounded-full px-6"
                  >
                    {submitted ? (
                      <><CheckCircle className="w-4 h-4" /> Đã lưu</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4" /> Xác nhận bán</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 py-1">
              <ShoppingCart className="w-5 h-5 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Chọn số lượng để lập đơn bán</p>
            </div>
          )}
        </div>
      </div>
      {showScanner && (
        <CameraScanner
          onDetected={handleScanDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
