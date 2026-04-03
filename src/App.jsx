import { useState, useEffect, useMemo, useContext } from 'react';
import { getEntries, addEntry, deleteEntry } from './dbServices';
import { AuthContext } from './AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login.jsx';

// Predefined Quick Remarks
const QUICK_REMARKS = ["Raashan", "Doodh Wala", "Bijli Bill", "Maasi", "Udhaar", "Gas Bill"];

function App() {
  const { user, loading } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0], // yyyy-mm-dd format
    time: "",
    amount: "",
    type: "credit", // credit = jama, debit = nikaale
    remarks: ""
  });

  // Fetch entries from Firestore
  const fetchAllEntries = async () => {
    setIsLoading(true);
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries", error);
      alert("Internet nahi hai but purana data dikh raha hoga (Offline mode).");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllEntries();
    }
  }, [user]);

  // Compute Filtered Entries
  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    return entries.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [entries, searchQuery]);

  // Compute Net Balance based on filtered entries
  const { totalCredit, totalDebit, netBalance } = useMemo(() => {
    let tCredit = 0;
    let tDebit = 0;
    filteredEntries.forEach(e => {
      if (e.credit) tCredit += Number(e.credit);
      if (e.debit) tDebit += Number(e.debit);
    });
    return {
      totalCredit: tCredit,
      totalDebit: tDebit,
      netBalance: tCredit - tDebit
    };
  }, [filteredEntries]);

  // Handle Form Submission
  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      alert("Barae meherbani Naam aur Raqam (Amount) enter karein.");
      return;
    }

    const newEntry = {
      name: formData.name,
      date: formData.date,
      time: formData.time,
      remarks: formData.remarks,
      credit: formData.type === "credit" ? Number(formData.amount) : 0,
      debit: formData.type === "debit" ? Number(formData.amount) : 0,
    };

    try {
      await addEntry(newEntry);
      setIsModalOpen(false);
      setFormData({
        ...formData,
        name: "",
        amount: "",
        remarks: "",
        time: ""
        // Keep date and type same for convenience
      });
      fetchAllEntries(); // Refresh the list
    } catch (error) {
      alert("Error aa gya save karte waqt!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Kiya aap waqai is entry ko delete karna chahte hain?")) {
      await deleteEntry(id);
      fetchAllEntries();
    }
  };

  // WhatsApp Share Functionality
  const shareViaWhatsApp = () => {
    let msg = `*Hisaab Kitaab (Ledger)*\n\n`;
    if (searchQuery) {
      msg += `Naam: *${searchQuery}*\n`;
    }
    msg += `Total Jama: ${totalCredit} PKR\n`;
    msg += `Total Nikaale: ${totalDebit} PKR\n`;
    
    let balanceText = "";
    if (netBalance > 0) balanceText = `Lena Hai: ${netBalance}`;
    else if (netBalance < 0) balanceText = `Dena Hai: ${Math.abs(netBalance)}`;
    else balanceText = `Hisaab Clear (0 balance)`;

    msg += `*Net Balance: ${balanceText} PKR*\n\n`;
    msg += `Tafseel (Details):\n`;

    filteredEntries.slice(0, 10).forEach(e => {
      const amtType = e.credit ? `Jama: ${e.credit}` : `Nikaale: ${e.debit}`;
      msg += `- ${e.date} | ${e.name} | ${amtType} | ${e.remarks}\n`;
    });

    if (filteredEntries.length > 10) {
      msg += `\n...aur entries hain jo app mei dekh sakte hain.`;
    }

    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    if (window.confirm("Kiya aap waqai Logout karna chahte hain?")) {
      signOut(auth);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-600 flex flex-col items-center justify-center font-urdu">
        <h1 className="text-white text-4xl font-bold animate-pulse">Loading...</h1>
        <p className="text-sky-100 mt-2">App khul rahi hai</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-urdu pb-24">
      {/* Header */}
      <header className="bg-sky-600 text-white p-4 shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hisaab Kitaab</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        
        {/* Net Balance Card */}
        <div className="bg-white rounded-xl shadow p-6 text-center border-t-8 border-sky-500">
          <h2 className="text-gray-500 text-lg mb-1">Baaki Hisaab {searchQuery ? `(${searchQuery})` : "(Sabka)"}</h2>
          
          {netBalance > 0 ? (
             <p className="text-4xl font-bold text-green-600">{netBalance} <span className="text-xl">PKR</span></p>
          ) : netBalance < 0 ? (
             <p className="text-4xl font-bold text-red-600">{Math.abs(netBalance)} <span className="text-xl">PKR</span></p>
          ) : (
             <p className="text-4xl font-bold text-gray-800">0 <span className="text-xl">PKR</span></p>
          )}
          
          <div className="text-gray-500 text-sm mt-3 flex justify-around">
            <span>Jama: <span className="text-green-600 font-bold">{totalCredit}</span></span>
            <span>Nikaale: <span className="text-red-500 font-bold">{totalDebit}</span></span>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={shareViaWhatsApp}
              className="bg-green-500 text-white w-full py-3 rounded-lg text-lg font-bold shadow flex justify-center items-center gap-2 hover:bg-green-600"
            >
              WhatsApp Par Hisaab Bhejein
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Naam se search karein... (Name)"
            className="w-full text-xl p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Taza Hisaab {filteredEntries.length > 0 ? `(${filteredEntries.length})` : ""}</h3>
          
          {isLoading && <p className="text-center text-gray-500">Loading data...</p>}
          
          {!isLoading && filteredEntries.length === 0 && (
             <p className="text-center text-gray-500 text-lg py-8">Koi record nahi mila.</p>
          )}

          {filteredEntries.map(entry => (
            <div key={entry.id} className={`bg-white p-4 rounded-lg shadow flex justify-between items-center border-l-8 ${entry.credit ? "border-green-500" : "border-red-500"}`}>
              <div className="flex-1">
                <p className="text-xl font-bold">{entry.name}</p>
                <p className="text-gray-500 text-sm mb-1">{entry.date} {entry.time ? `• ${entry.time}` : ""}</p>
                <p className="text-gray-600 text-md bg-gray-100 rounded inline-block px-2">{entry.remarks || "Koi detail nahi"}</p>
              </div>
              <div className="text-right flex flex-col items-end pl-2">
                {entry.credit ? (
                  <p className="text-3xl font-bold text-green-600">{entry.credit} <span className="text-sm block leading-none font-normal">Jama</span></p>
                ) : (
                  <p className="text-3xl font-bold text-red-600">{entry.debit} <span className="text-sm block leading-none font-normal">Nikaale</span></p>
                )}
                
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="mt-3 text-red-400 hover:text-red-700 text-sm font-bold underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
        </div>

      </main>

      {/* Floating Add Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-sky-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:bg-sky-700 active:scale-95 transition-transform border-4 border-white"
        aria-label="Naya Hisaab (Add Entry)"
      >
        <span className="text-5xl leading-none -mt-2">+</span>
      </button>

      {/* Add Entry Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[500px] rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Naya Hisaab Likhain</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-3xl shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full pb-1 hover:bg-gray-200">×</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-5">
              
              {/* Type Switch */}
              <div className="flex rounded-lg overflow-hidden border border-gray-300 w-full mb-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'credit'})}
                  className={`flex-1 py-4 text-xl font-bold ${formData.type === 'credit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Jama Kiye (+)
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'debit'})}
                  className={`flex-1 py-4 text-xl font-bold ${formData.type === 'debit' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Nikaale (-)
                </button>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Naam (Name)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full text-xl p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="Kiska hisaab hai?"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Raqam (Amount)</label>
                <input 
                  type="number"
                  inputMode="numeric"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="w-full text-2xl p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 font-bold" 
                  placeholder="0 PKRs"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-bold mb-2">Tareekh (Date)</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full text-lg p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" 
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-bold mb-2">Waqt (Time)</label>
                  <input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full text-lg p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Tafseel (Remarks)</label>
                <input 
                  type="text" 
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full text-xl p-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 mb-3" 
                  placeholder="Aata, Chini, Doodh..."
                />
                
                {/* Quick Remarks Chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_REMARKS.map(remark => (
                    <button 
                      key={remark} 
                      type="button"
                      onClick={() => setFormData({...formData, remarks: remark})}
                      className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-4 py-2 rounded-full font-semibold border border-sky-200"
                    >
                      {remark}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 pb-2">
                <button 
                  type="submit" 
                  className={`w-full py-4 text-2xl font-bold rounded-lg shadow-lg text-white ${formData.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  Save Karein
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Hidden Signout Feature */}
      <div className="text-center mt-8 pb-4 opacity-30 hover:opacity-100 transition-opacity">
        <button onClick={handleLogout} className="text-gray-600 underline font-bold rounded p-2 text-md">
          Log Out (Hisaab Band Karein)
        </button>
      </div>

    </div>
  );
}

export default App;
