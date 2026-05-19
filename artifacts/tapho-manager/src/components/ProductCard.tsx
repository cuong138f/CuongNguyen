import React, { useState, useEffect, useRef } from "react";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { formatVND } from "@/lib/format";
import { useDeleteProduct, getListProductsQueryKey, getGetProductStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  index: number;
}

export default function ProductCard({ product, onEdit, index }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteProduct = useDeleteProduct();
  const deleteFnRef = useRef(deleteProduct.mutate);
  deleteFnRef.current = deleteProduct.mutate;

  const handleDelete = () => {
    deleteFnRef.current(
      { id: product.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProductStatsQueryKey() });
          toast({
            title: "Đã xóa",
            description: `Đã xóa mặt hàng "${product.name}"`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể xóa mặt hàng. Vui lòng thử lại.",
          });
        }
      }
    );
  };

  return (
    <Card 
      className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border-transparent bg-white animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <div className="aspect-square w-full bg-secondary/50 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif font-semibold text-lg line-clamp-1 flex-1 pr-2" title={product.name}>{product.name}</h3>
          <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full text-sm whitespace-nowrap">
            {formatVND(product.price)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
          {product.description || "Không có mô tả"}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-medium bg-secondary px-2.5 py-1 rounded-md text-secondary-foreground">
            {product.quantity || "N/A"}
          </span>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(product)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa mặt hàng này?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa "{product.name}"? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
