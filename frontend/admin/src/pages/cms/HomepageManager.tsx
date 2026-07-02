import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function HomepageManager() {
  const [banners, setBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  
  // New Banner Form State
  const [bannerForm, setBannerForm] = useState({
    title: '', subtitle: '', buttonText: '', buttonLink: '', image: { url: '' }, homepageSection: 'hero'
  });

  // New Announcement Form State
  const [announcementText, setAnnouncementText] = useState('');

  const fetchCMS = async () => {
    try {
      const bRes = await fetch(`${API_URL}/cms/banners`);
      const bData = await bRes.json();
      if (bData.success) setBanners(bData.data || []);

      const aRes = await fetch(`${API_URL}/cms/announcements`);
      const aData = await aRes.json();
      if (aData.success) setAnnouncements(aData.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleBannerSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/cms/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm)
      });
      setBannerForm({ title: '', subtitle: '', buttonText: '', buttonLink: '', image: { url: '' }, homepageSection: 'hero' });
      fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBannerDelete = async (id: string) => {
    if (confirm('Delete banner?')) {
      await fetch(`${API_URL}/cms/banners/${id}`, { method: 'DELETE' });
      fetchCMS();
    }
  };

  const handleAnnouncementAdd = async () => {
    if (!announcementText) return;
    const newArr = [...announcements, { text: announcementText, isActive: true }];
    try {
      await fetch(`${API_URL}/cms/announcements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementBar: newArr })
      });
      setAnnouncementText('');
      fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnnouncementDelete = async (index: number) => {
    const newArr = announcements.filter((_, i) => i !== index);
    try {
      await fetch(`${API_URL}/cms/announcements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementBar: newArr })
      });
      fetchCMS();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <h1 className="text-2xl font-bold">Homepage CMS</h1>

      {/* Announcements Section */}
      <section className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Announcement Bar</h2>
        <div className="flex gap-4 mb-4">
          <input 
            value={announcementText} 
            onChange={e => setAnnouncementText(e.target.value)} 
            placeholder="e.g. Free shipping on orders over ₹2000" 
            className="flex-1 border p-2 rounded" 
          />
          <button onClick={handleAnnouncementAdd} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>
        <ul className="space-y-2">
          {announcements.map((a: any, i) => (
            <li key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
              <span>{a.text}</span>
              <button onClick={() => handleAnnouncementDelete(i)} className="text-red-500">Delete</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Banners Section */}
      <section className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Banners</h2>
        
        {/* Add Banner Form */}
        <form onSubmit={handleBannerSubmit} className="mb-8 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
          <div><label className="block text-sm">Title</label><input required value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Subtitle</label><input value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Button Text</label><input value={bannerForm.buttonText} onChange={e => setBannerForm({...bannerForm, buttonText: e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Button Link</label><input value={bannerForm.buttonLink} onChange={e => setBannerForm({...bannerForm, buttonLink: e.target.value})} className="w-full border p-2 rounded" /></div>
          <div><label className="block text-sm">Image URL</label><input required type="url" value={bannerForm.image.url} onChange={e => setBannerForm({...bannerForm, image: { url: e.target.value }})} className="w-full border p-2 rounded" /></div>
          <div>
            <label className="block text-sm">Section</label>
            <select value={bannerForm.homepageSection} onChange={e => setBannerForm({...bannerForm, homepageSection: e.target.value})} className="w-full border p-2 rounded">
              <option value="hero">Hero</option>
              <option value="trending">Trending</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="bg-black text-white px-4 py-2 rounded">Add Banner</button>
          </div>
        </form>

        {/* Banner List */}
        <div className="grid grid-cols-2 gap-4">
          {banners.map((b: any) => (
            <div key={b._id} className="border rounded overflow-hidden flex flex-col">
              <img src={b.image?.url} alt="" className="h-32 object-cover w-full" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.subtitle}</p>
                  <p className="text-xs bg-gray-200 inline-block px-2 rounded mt-2">{b.homepageSection.toUpperCase()}</p>
                </div>
                <button onClick={() => handleBannerDelete(b._id)} className="text-red-500 mt-4 text-left">Delete Banner</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
