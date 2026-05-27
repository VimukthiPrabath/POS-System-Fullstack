"use client";
import { useEffect, useState } from "react";

export default function Home() {
  // කුමන මෙනු එකද තෝරාගෙන තියෙන්නේ කියලා තියාගන්න State එක
  const [activeMenu, setActiveMenu] = useState("Products");

  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", quantity: "" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({ id: "", name: "", price: "", quantity: "" });

  // Sales (බිල් ගැසීම) සඳහා States
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sellQuantity, setSellQuantity] = useState("1");
  const [saleMessage, setSaleMessage] = useState({ type: "", text: "" });

  // Products ටික Load කිරීම
  const fetchProducts = () => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Product CRUD Functions (කලින් ඒවාමයි) ---
  const handleAddProduct = (e: any) => {
    e.preventDefault();
    fetch("http://localhost:8080/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts([...products, data] as any);
        setIsModalOpen(false);
        setNewProduct({ name: "", price: "", quantity: "" });
      });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("ඔබට විශ්වාසද මෙම භාණ්ඩය මකා දැමිය යුතුයි කියා?")) {
      fetch(`http://localhost:8080/api/products/${id}`, { method: "DELETE" })
        .then(() => setProducts(products.filter((p) => p.id !== id)));
    }
  };

  const openEditModal = (product: any) => {
    setEditProduct(product);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = (e: any) => {
    e.preventDefault();
    fetch(`http://localhost:8080/api/products/${editProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editProduct),
    })
      .then((res) => res.json())
      .then((updatedData) => {
        setProducts(products.map((p) => (p.id === updatedData.id ? updatedData : p)));
        setIsEditModalOpen(false);
      });
  };

  // --- Sales Function (අලුත් කෑල්ල!) ---
  const handleCheckout = (e: any) => {
    e.preventDefault();
    setSaleMessage({ type: "", text: "" });

    fetch("http://localhost:8080/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: parseInt(selectedProductId),
        quantity: parseInt(sellQuantity)
      }),
    })
      .then((res) => res.text()) // මෙතන JSON නෙවෙයි Text ගන්නේ!
      .then((message) => {
        if (message.startsWith("Error")) {
          setSaleMessage({ type: "error", text: message });
        } else {
          setSaleMessage({ type: "success", text: message });
          // බිල සාර්ථක නම්, අඩු වුණ Stock එක පේන්න Products ටික ආයෙත් Load කරනවා
          fetchProducts();
          setSelectedProductId("");
          setSellQuantity("1");
        }
      })
      .catch((err) => {
        setSaleMessage({ type: "error", text: "සර්වර් එක හා සම්බන්ධ වීමේ දෝෂයක්!" });
      });
  };

  const totalItems = products.length;
  const totalStock = products.reduce((sum, p: any) => sum + (p.quantity || 0), 0);
  const lowStock = products.filter((p: any) => p.quantity <= 10).length;

  return (
    <div className="flex h-screen bg-[#0A0A0F] font-sans text-[#F0EEFF] overflow-hidden" style={{ fontFamily: "'Syne', sans-serif" }}>
      
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#111118] border-r border-white/[0.06] flex flex-col flex-shrink-0 z-10">
        <div className="p-6 pb-5 border-b border-white/[0.06]">
          <div className="text-[22px] font-black tracking-tight">
            POS<span className="text-[#8B85FF]">PRO</span>
          </div>
          <div className="text-[10px] text-[#5A5478] tracking-[2px] mt-0.5 font-mono">POINT OF SALE</div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <div className="text-[9px] text-[#5A5478] tracking-[2px] px-2 py-2 font-mono">MENU</div>
          {[
            { icon: "📦", label: "Products" },
            { icon: "🧾", label: "Sales" },
            { icon: "📊", label: "Analytics" },
          ].map(({ icon, label }) => (
            <button 
               key={label} 
               onClick={() => setActiveMenu(label)}
               className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all border text-left ${
                 activeMenu === label
                   ? "text-[#F0EEFF] bg-[rgba(108,99,255,0.12)] border-[rgba(108,99,255,0.25)]"
                   : "text-[#9990CC] border-transparent hover:text-[#F0EEFF] hover:bg-[#18181F]"
               }`}>
              <span className="text-sm">{icon}</span> {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-7 py-4 border-b border-white/[0.06] bg-[#111118] flex justify-between items-center flex-shrink-0 z-0">
          <div className="text-[18px] font-bold tracking-tight">
            {activeMenu === "Products" ? "Inventory Management" : activeMenu === "Sales" ? "Point of Sale (Billing)" : "Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-[rgba(34,217,138,0.12)] text-[#22D98A] border border-[rgba(34,217,138,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D98A] animate-pulse" /> System Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-7 relative z-0">
          
          {/* =========================================
              PRODUCTS VIEW (පරණ කොටස)
              ========================================= */}
          {activeMenu === "Products" && (
            <>
              {/* Stats & Table කේතය (ඔයා කලින් දාපු එකමයි) */}
              <div className="grid grid-cols-3 gap-3.5 mb-6">
                {[
                  { label: "TOTAL PRODUCTS", value: totalItems, icon: "🏷️", color: "#6C63FF", dimColor: "rgba(108,99,255,0.12)", delta: "+12%" },
                  { label: "TOTAL STOCK", value: totalStock.toLocaleString(), icon: "📦", color: "#22D98A", dimColor: "rgba(34,217,138,0.12)", delta: "+5%" },
                  { label: "LOW STOCK ALERTS", value: lowStock, icon: "⚡", color: "#F5A623", dimColor: "rgba(245,166,35,0.1)", delta: "ALERTS" },
                ].map(({ label, value, icon, dimColor, delta }) => (
                  <div key={label} className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-base" style={{ background: dimColor }}>{icon}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(34,217,138,0.12)] text-[#22D98A]">{delta}</span>
                    </div>
                    <div className="text-[10px] text-[#5A5478] tracking-[1.5px] font-mono mb-1.5">{label}</div>
                    <div className="text-[28px] font-bold tracking-tight leading-none">{value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#111118] border border-white/[0.06] rounded-[18px] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex justify-between items-center">
                  <div>
                    <div className="text-[14px] font-bold">Product List</div>
                    <div className="text-[11px] text-[#5A5478] font-mono mt-0.5">{products.length} items</div>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="bg-[#6C63FF] hover:bg-[#8B85FF] text-white px-4 py-2 rounded-[10px] text-[12px] font-semibold transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(108,99,255,0.3)]">
                    + Add Product
                  </button>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#18181F] border-b border-white/[0.06]">
                      {["ID", "PRODUCT NAME", "PRICE", "STOCK LEVEL", "ACTIONS"].map((h, i) => (
                        <th key={h} className={`px-5 py-3 text-[9px] font-semibold text-[#5A5478] tracking-[2px] text-left font-mono ${i === 4 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: any) => (
                      <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition group">
                        <td className="px-5 py-3.5 text-[11px] text-[#5A5478] font-mono">#{String(p.id).padStart(4, "0")}</td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold">{p.name}</td>
                        <td className="px-5 py-3.5 text-[13px] text-[#8B85FF] font-mono">Rs. {p.price?.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-semibold font-mono border ${
                            p.quantity > 10 ? "bg-[rgba(34,217,138,0.12)] text-[#22D98A] border-[rgba(34,217,138,0.2)]" : "bg-[rgba(255,91,91,0.1)] text-[#FF5B5B] border-[rgba(255,91,91,0.2)]"
                          }`}>
                            {p.quantity} in stock
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(p)} className="bg-[rgba(108,99,255,0.12)] text-[#8B85FF] border border-[rgba(108,99,255,0.2)] rounded-[6px] px-3 py-1 text-[11px] font-semibold hover:bg-[rgba(108,99,255,0.2)] transition">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="bg-[rgba(255,91,91,0.1)] text-[#FF5B5B] border border-[rgba(255,91,91,0.2)] rounded-[6px] px-3 py-1 text-[11px] font-semibold hover:bg-[rgba(255,91,91,0.2)] transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* =========================================
              SALES VIEW (අලුත් Checkout කොටස)
              ========================================= */}
          {activeMenu === "Sales" && (
            <div className="max-w-2xl mx-auto mt-10">
              <div className="bg-[#111118] border border-white/[0.06] rounded-[18px] p-8 shadow-2xl">
                <h2 className="text-[24px] font-bold mb-6 tracking-tight flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[rgba(108,99,255,0.12)] text-[#8B85FF] flex items-center justify-center text-xl">🛒</span>
                  New Sale Checkout
                </h2>

                {/* Success / Error Message Alert */}
                {saleMessage.text && (
                  <div className={`mb-6 p-4 rounded-[10px] text-[13px] font-semibold font-mono border ${
                    saleMessage.type === "success" 
                    ? "bg-[rgba(34,217,138,0.12)] text-[#22D98A] border-[rgba(34,217,138,0.2)]" 
                    : "bg-[rgba(255,91,91,0.1)] text-[#FF5B5B] border-[rgba(255,91,91,0.2)]"
                  }`}>
                    {saleMessage.text}
                  </div>
                )}

                <form onSubmit={handleCheckout} className="flex flex-col gap-6">
                  <div>
                    <label className="text-[11px] text-[#5A5478] font-mono tracking-[1.5px] mb-2 block">SELECT PRODUCT</label>
                    <select 
                      required
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-[#18181F] border border-white/[0.06] rounded-[12px] px-5 py-3.5 text-[14px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition appearance-none"
                    >
                      <option value="" disabled>-- භාණ්ඩයක් තෝරන්න --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - Rs. {p.price} ({p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#5A5478] font-mono tracking-[1.5px] mb-2 block">QUANTITY (ප්‍රමාණය)</label>
                    <input 
                      required 
                      type="number" 
                      min="1"
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(e.target.value)}
                      className="w-full bg-[#18181F] border border-white/[0.06] rounded-[12px] px-5 py-3.5 text-[14px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={!selectedProductId}
                    className="mt-4 w-full bg-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8B85FF] text-white py-4 rounded-[12px] text-[14px] font-bold tracking-wide transition shadow-[0_0_20px_rgba(108,99,255,0.4)]">
                    COMPLETE SALE (බිල සකසන්න)
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Analytics View Placeholder */}
          {activeMenu === "Analytics" && (
            <div className="flex flex-col items-center justify-center h-full text-[#5A5478]">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-xl font-bold">Analytics Dashboard</h2>
              <p className="mt-2 text-sm font-mono">Coming soon...</p>
            </div>
          )}

        </div>

        {}
        {}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111118] border border-white/[0.1] rounded-[18px] p-7 w-[400px] shadow-2xl">
              <h2 className="text-[18px] font-bold mb-5 tracking-tight text-[#F0EEFF]">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">PRODUCT NAME</label>
                  <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">PRICE (RS.)</label>
                    <input required type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">STOCK</label>
                    <input required type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-transparent border border-white/[0.1] hover:bg-white/[0.05] text-[#9990CC] py-2.5 rounded-[10px] text-[12px] font-semibold transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-[#6C63FF] hover:bg-[#8B85FF] text-white py-2.5 rounded-[10px] text-[12px] font-semibold transition shadow-[0_0_15px_rgba(108,99,255,0.3)]">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#111118] border border-white/[0.1] rounded-[18px] p-7 w-[400px] shadow-2xl">
              <h2 className="text-[18px] font-bold mb-5 tracking-tight text-[#F0EEFF]">Edit Product</h2>
              <form onSubmit={handleUpdateProduct} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">PRODUCT NAME</label>
                  <input required type="text" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">PRICE (RS.)</label>
                    <input required type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5A5478] font-mono tracking-[1px] mb-1.5 block">STOCK</label>
                    <input required type="number" value={editProduct.quantity} onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })} className="w-full bg-[#18181F] border border-white/[0.06] rounded-[10px] px-4 py-2.5 text-[13px] text-[#F0EEFF] outline-none focus:border-[#6C63FF] transition" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-transparent border border-white/[0.1] hover:bg-white/[0.05] text-[#9990CC] py-2.5 rounded-[10px] text-[12px] font-semibold transition">Cancel</button>
                  <button type="submit" className="flex-1 bg-[#22D98A] hover:bg-[#1ebf79] text-[#0A0A0F] py-2.5 rounded-[10px] text-[12px] font-bold transition shadow-[0_0_15px_rgba(34,217,138,0.3)]">Update Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}