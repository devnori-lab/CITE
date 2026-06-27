import React, { useState, useRef } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isNewDevice, setIsNewDevice] = useState(false);
  
  // Telemetry State
  const [amount, setAmount] = useState('');
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [result, setResult] = useState(null);
  
  // Refs for tracking keystrokes
  const lastKeyTime = useRef(null);
  const keyIntervals = useRef([]);

  // Telemetry Tracker: Keystroke Dynamics
  const handlePasswordKeyDown = (e) => {
    const currentTime = Date.now();
    if (lastKeyTime.current) {
      const timeDiff = currentTime - lastKeyTime.current;
      keyIntervals.current.push(timeDiff);
    }
    lastKeyTime.current = currentTime;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Calculate average typing speed
    if (keyIntervals.current.length > 0) {
      const sum = keyIntervals.current.reduce((a, b) => a + b, 0);
      setTypingSpeed(sum / keyIntervals.current.length);
    } else {
      setTypingSpeed(10); // Assume copy-paste if no intervals recorded
    }
    setIsLoggedIn(true);
  };

  const handleTransfer = async () => {
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || 'test_user',
          amount: parseFloat(amount),
          is_new_device: isNewDevice,
          avg_typing_speed_ms: typingSpeed
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error communicating with CITE engine", error);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', maxWidth: '500px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>CITE: Continuous Identity Trust Engine</h2>
      
      {/* Dev Tools (Hidden in production) */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <strong>Admin Console (Mock Settings)</strong><br/><br/>
        <label>
          <input type="checkbox" checked={isNewDevice} onChange={(e) => setIsNewDevice(e.target.checked)} />
          Simulate "New Device / Unknown IP"
        </label>
      </div>

      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <h3>Login securely</h3>
          <input type="text" placeholder="Username" required onChange={(e) => setUsername(e.target.value)} style={inputStyle} /><br/>
          <input type="password" placeholder="Password (Type normally vs Copy-Paste)" required onKeyDown={handlePasswordKeyDown} style={inputStyle} /><br/>
          <button type="submit" style={buttonStyle}>Login</button>
        </form>
      ) : (
        <div>
          <h3>Welcome, {username}</h3>
          <p style={{ fontSize: '12px', color: 'gray' }}>Telemetry Log: Avg Typing Speed detected as {Math.round(typingSpeed)}ms/key.</p>
          
          <input type="number" placeholder="Enter transfer amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} /><br/>
          <button onClick={handleTransfer} style={buttonStyle}>Transfer Funds</button>

          {result && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: result.score > 70 ? '#d4edda' : result.score >= 40 ? '#fff3cd' : '#f8d7da' }}>
              <h4>Trust Score: {result.score} / 100</h4>
              <p><strong>Action:</strong> {result.status.toUpperCase()}</p>
              <p><strong>Friction Required:</strong> {result.friction}</p>
              {result.factors.length > 0 && (
                <ul>
                  {result.factors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default App;