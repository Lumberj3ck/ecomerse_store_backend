import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Input } from "@medusajs/ui";
import { useState } from "react";
import Medusa from "@medusajs/js-sdk";

const ProductImportFromAli = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [itemId, setItemId] = useState("");
  const sdk = new Medusa({
    baseUrl: "/",
    auth: {
      type: "session",
    },
  });

  const handleImport = async () => {
    if (!itemId) {
      setMessage("Please enter an item ID");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await sdk.client.fetch(`/admin/ae_product_info?itemId=${itemId}`);
      
      if (response.data?.result?.status?.data === "error") {
        throw new Error(response.data.result.status.msg["user-side-violation"] || "Invalid item ID");
      }

      const data = response;
      console.log(data);

      await sdk.client.fetch("/admin/products", {
        method: "post", 
        body: {
          title: data.data.result.item.title,
          description: data.data.result.item.title,
          images: data.data.result.item.images.map((img: string) => ({
            url: "https:" + img
          })),
          options: [
            {
              title: "Color",
              values: data.data.result.item.sku.props[0].values.map((v: {name: string}) => v.name)
            }
          ],
        //   variants: data.data.result.item.sku.base.map((variant: any) => ({
        //     title: variant.propMap.split(":")[1],
        //     inventory_quantity: variant.quantity,
        //     prices: [{
        //       amount: Math.round(variant.promotionPrice * 100),
        //       currency_code: "usd"
        //     }],
        //     options: [{
        //       value: data.data.result.item.sku.props[0].values.find(
        //         (v: {vid: number}) => v.vid === parseInt(variant.propMap.split(":")[1])
        //       )?.name
        //     }]
        //   })),
          weight: data.data.result.delivery.packageDetail.weight,
          height: data.data.result.delivery.packageDetail.height,
          width: data.data.result.delivery.packageDetail.width,
          length: data.data.result.delivery.packageDetail.length,
          status: "draft"
        }
      });


      setMessage("Successfully imported product!");
      setItemId(""); // Clear input after success
    } catch (error: any) {
      setMessage(
        "Error importing product: " + (error.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-y-4">
        <Input
          type="text"
          placeholder="Enter AliExpress Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        />
        <Button variant="primary" onClick={handleImport} disabled={isLoading}>
          {isLoading ? "Importing..." : "Import from AliExpress"}
        </Button>
        {message && (
          <div
            className={`text-sm ${
              message.includes("Error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default ProductImportFromAli;
