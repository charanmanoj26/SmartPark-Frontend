import { useEffect, useMemo, useState } from "react";
import "./App.css";

const initialSlots = [];

const initialBookings = [];

function StatCard({ label, value, detail, color, icon }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}
export default function App() {
  const [slots, setSlots] = useState(initialSlots);
  
useEffect(() => {
  fetch("https://smartpark-backend-c77g.onrender.com/api/parking")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load parking slots");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Parking data:", data);

      setSlots(
        data.map((slot) => {
          console.log("Slot status:", slot.slot, slot.status);
          return {
            id: slot.slot,
            occupied: slot.status !== "Available",
            vehicle: "",
            status: slot.status,
          };
        })
      );
    })
    .catch((error) => {
      console.error("Parking API error:", error);
    });
}, []);
  const [bookings, setBookings] = useState(initialBookings);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState("Today");

  const available = slots.filter((slot) => slot.status === "Available" || (!slot.status && !slot.occupied)).length;
  const occupied = slots.filter((slot) => slot.status === "Occupied" || (!slot.status && slot.occupied)).length;
  const reserved = slots.filter((slot) => slot.status === "Reserved").length;
  const occupancy = Math.round(((occupied + reserved) / slots.length) * 100);

  const filteredSlots = useMemo(
    () =>
      slots.filter((slot) =>
        slot.id.toLowerCase().includes(search.toLowerCase())
      ),
    [slots, search]
  );

  function bookParking() {
    if (!vehicleNumber.trim() || !selectedSlot) {
      setNotice("Enter a vehicle number and select an available slot.");
      return;
    }

    const slot = slots.find((item) => item.id === selectedSlot);

    if (!slot || slot.occupied) {
      setNotice("That parking slot is no longer available.");
      return;
    }

    const booking = {
      id: Date.now(),
      slot: selectedSlot,
      vehicle: vehicleNumber.trim().toUpperCase(),
      time: new Date().toLocaleString(),
    };

    setSlots((current) =>
      current.map((item) =>
        item.id === selectedSlot
          ? { ...item, occupied: true, vehicle: booking.vehicle }
          : item
      )
    );

    setBookings((current) => [booking, ...current]);
    setSelectedSlot("");
    setVehicleNumber("");
    setNotice(`Successfully booked ${booking.slot}.`);
  }

  function cancelBooking(booking) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === booking.slot
          ? { ...slot, occupied: false, vehicle: "" }
          : slot
      )
    );

    setBookings((current) =>
      current.filter((item) => item.id !== booking.id)
    );

    setNotice(`${booking.slot} is now available.`);
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setNotice("");
  }

  return (
    <div className="smartpark">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => changeTab("Overview")}>
          <div className="brand-mark">P</div>
          <div>
            <strong>Smart<span>Park</span></strong>
            <small>INTELLIGENT PARKING</small>
          </div>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        {[
          ["Overview", "◫"],
          ["Parking Areas", "▦"],
          ["Bookings", "◷"],
        ].map(([tab, icon]) => (
          <button
            key={tab}
            className={`nav-link ${activeTab === tab ? "active" : ""}`}
            onClick={() => changeTab(tab)}
          >
            <span className="nav-icon">{icon}</span>
            {tab}
            {tab === "Bookings" && bookings.length > 0 && (
              <span className="nav-count">{bookings.length}</span>
            )}
          </button>
        ))}

        <div className="sidebar-label tools-label">MANAGEMENT</div>

        <button
          className={`nav-link ${activeTab === "Analytics" ? "active" : ""}`}
          onClick={() => changeTab("Analytics")}
        >
          <span className="nav-icon">▥</span>
          Analytics
        </button>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>Parking system</strong>
              <small>Local demo active</small>
            </div>
          </div>
          <div className="user-profile">
            <div className="user-avatar">SP</div>
            <div>
              <strong>SmartPark Admin</strong>
              <small>Administrator</small>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>SmartPark</span><b>/</b><strong>{activeTab}</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-status"><i /> Demo system</span>
            <div className="top-avatar">SP</div>
          </div>
        </header>

        {notice && (
          <div className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {activeTab === "Overview" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">PARKING INTELLIGENCE</div>
                <h1>Parking overview<span className="heading-period">.</span></h1>
                <p>Monitor occupancy and manage your parking spaces.</p>
              </div>
              <select
                className="period-select"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                aria-label="Statistics period"
              >
                <option>Today</option>
                <option>This week</option>
                <option>This month</option>
              </select>
            </section>

            <section className="stats-grid">
              <StatCard
                label="Total parking slots"
                value={slots.length}
                detail="Parking capacity"
                color="blue"
                icon="▦"
              />
              <StatCard
                label="Available spaces"
                value={available}
                detail={`${100 - occupancy}% of total capacity`}
                color="mint"
                icon="✓"
              />
              <StatCard
                label="Occupied spaces"
                value={occupied}
                detail={`${occupancy}% occupancy`}
                color="orange"
                icon="▤"
              />
              <StatCard
                label="My bookings"
                value={bookings.length}
                detail="Current demo bookings"
                color="purple"
                icon="◷"
              />
            </section>

            <section className="content-grid">
              <div className="panel parking-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Parking layout</h2>
                    <p>MAIN PARKING AREA · LEVEL 01</p>
                  </div>
                  <button className="outline-btn" onClick={() => changeTab("Parking Areas")}>
                    View all slots ↗
                  </button>
                </div>

                <div className="parking-legend">
                  <span><i className="legend-available" /> Available</span>
                  <span><i className="legend-occupied" /> Occupied</span>
                  <span><i className="legend-selected" /> Selected</span>
                </div>

                <div className="parking-map">
                  <div className="driveway-label">ENTRY →</div>
                  <div className="parking-bays">
                    {slots.map((slot, index) => (
                      <button
                        key={slot.id}
                        className={`parking-bay ${slot.status === "Reserved" ? "reserved" : slot.occupied ? "occupied" : "available"} ${selectedSlot === slot.id ? "selected" : ""}`}
                        onClick={() => {
                          if (slot.occupied) {
                            setNotice(`${slot.id} is occupied. Select a green slot.`);
                          } else {
                            setSelectedSlot(slot.id);
                            setActiveTab("Parking Areas");
                            setNotice("");
                          }
                        }}
                      >
                        <span className="bay-number">{slot.id}</span>
                        <span className="bay-car">{slot.occupied ? "🚘" : "🚗"}</span>
                        <span className="bay-status">{slot.status || (slot.occupied ? "Occupied" : "Available")}</span>
                        <span className="bay-light" />
                        <span className="bay-position">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                  <div className="driveway-label exit-label">→ EXIT</div>
                </div>

                <div className="map-footer">
                  <span><i className="status-dot" /> Slot status shown for this demo</span>
                  <span>{available} spaces free</span>
                </div>
              </div>

              <div className="right-column">
                <div className="panel occupancy-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Occupancy rate</h2>
                      <p>Current parking utilization</p>
                    </div>
                    <span className="tiny-menu">···</span>
                  </div>

                  <div className="occupancy-display">
                    <div
                      className="occupancy-ring"
                      style={{ "--occupancy": `${occupancy}%` }}
                    >
                      <div>
                        <strong>{occupancy}%</strong>
                        <small>occupied</small>
                      </div>
                    </div>
                    <div className="occupancy-breakdown">
                    <div><i className="legend-available" /><span>Available</span><strong>{available}</strong></div>
                    <div><i className="legend-occupied" /><span>Occupied</span><strong>{occupied}</strong></div>
                    <div><i className="legend-reserved" /><span>Reserved</span><strong>{reserved}</strong></div>
                    </div>
                  </div>
                  <div className="capacity-bar">
                    <span style={{ width: `${occupancy}%` }} />
                  </div>
                  <div className="capacity-caption">
                    <span>Space utilization</span><strong>{occupied}/{slots.length}</strong>
                  </div>
                </div>

                <div className="panel booking-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Quick booking</h2>
                      <p>Reserve an available space</p>
                    </div>
                    <span className="booking-icon">＋</span>
                  </div>

                  <label htmlFor="vehicle-number">Vehicle registration</label>
                  <input
                    id="vehicle-number"
                    className="form-input"
                    value={vehicleNumber}
                    onChange={(event) => setVehicleNumber(event.target.value)}
                    placeholder="e.g. TS09AB1234"
                  />

                  <label htmlFor="parking-slot">Parking slot</label>
                  <select
                    id="parking-slot"
                    className="form-input"
                    value={selectedSlot}
                    onChange={(event) => setSelectedSlot(event.target.value)}
                  >
                    <option value="">Choose an available slot</option>
                    {slots.filter((slot) => !slot.occupied).map((slot) => (
                      <option key={slot.id} value={slot.id}>{slot.id}</option>
                    ))}
                  </select>

                  <button className="primary-btn" onClick={bookParking}>
                    Confirm reservation <span>→</span>
                  </button>
                  <small className="form-footnote">Demo booking · No payment required</small>
                </div>
              </div>
            </section>

            <section className="panel recent-panel">
              <div className="panel-heading">
                <div>
                  <h2>Recent bookings</h2>
                  <p>Your latest reservations in this session</p>
                </div>
                <button className="outline-btn" onClick={() => changeTab("Bookings")}>
                  View bookings ↗
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="empty-bookings">
                  <span>◷</span>
                  <div><strong>No bookings yet</strong><p>New reservations will appear here.</p></div>
                </div>
              ) : (
                <div className="booking-table-wrap">
                  <table>
                    <thead><tr><th>Parking slot</th><th>Vehicle number</th><th>Booking time</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td><strong>{booking.slot}</strong></td>
                          <td>{booking.vehicle}</td>
                          <td>{booking.time}</td>
                          <td><span className="confirmed-tag">Confirmed</span></td>
                          <td><button className="cancel-btn" onClick={() => cancelBooking(booking)}>Cancel</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "Parking Areas" && (
          <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">SPACE MANAGEMENT</div>
                <h1>Parking areas<span className="heading-period">.</span></h1>
                <p>Select an available space to reserve it.</p>
              </div>
              <div className="available-badge">{available} AVAILABLE</div>
            </section>

            <div className="panel area-panel">
              <div className="panel-heading">
                <div><h2>Main parking area</h2><p>LEVEL 01 · {slots.length} TOTAL SPACES</p></div>
                <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slot..." />
              </div>
              <div className="area-grid">
                {filteredSlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={slot.occupied}
                    className={`area-slot ${slot.occupied ? "occupied" : "available"} ${selectedSlot === slot.id ? "selected" : ""}`}
                    onClick={() => { setSelectedSlot(slot.id); setNotice(`${slot.id} selected. Enter your vehicle number in Quick booking.`); }}
                  >
                    <span>{slot.occupied ? "🚘" : "🚗"}</span>
                    <strong>{slot.id}</strong>
                    <small>{selectedSlot === slot.id ? "Selected" : slot.status === "Reserved" ? "Reserved" : slot.occupied ? "Occupied" : "Available"}</small>
                  </button>
                ))}
              </div>
              </div>
            <div className="panel booking-panel">
              <div className="panel-heading">
                <div>
                  <h2>Quick booking</h2>
                  <p>Reserve your selected space</p>
                </div>
                <span className="booking-icon">＋</span>
              </div>

              <label htmlFor="area-vehicle-number">Vehicle registration</label>
              <input
                id="area-vehicle-number"
                className="form-input"
                value={vehicleNumber}
                onChange={(event) => setVehicleNumber(event.target.value)}
                placeholder="e.g. TS09AB1234"
              />

              <button className="primary-btn" onClick={bookParking}>
                Confirm reservation <span>→</span>
              </button>
              <small className="form-footnote">Demo booking · No payment required</small>
            </div>
          </>
        )}
        {activeTab === "Bookings" && (
          <section className="panel full-panel">
            <div className="page-heading">
              <div><div className="eyebrow">RESERVATION MANAGEMENT</div><h1>My bookings<span className="heading-period">.</span></h1><p>Manage your current parking reservations.</p></div>
              <button className="primary-btn" onClick={() => changeTab("Parking Areas")}>Find a space ↗</button>
            </div>
            {bookings.length === 0 ? (
              <div className="empty-bookings"><span>◷</span><div><strong>No reservations yet</strong><p>Book an available parking slot to see it here.</p></div></div>
            ) : (
              <div className="booking-table-wrap">
                <table><thead><tr><th>Parking slot</th><th>Vehicle number</th><th>Booking time</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>{bookings.map((booking) => (
                    <tr key={booking.id}><td><strong>{booking.slot}</strong></td><td>{booking.vehicle}</td><td>{booking.time}</td><td><span className="confirmed-tag">Confirmed</span></td><td><button className="cancel-btn" onClick={() => cancelBooking(booking)}>Cancel</button></td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "Analytics" && (
          <>
            <section className="page-heading">
              <div><div className="eyebrow">PARKING INSIGHTS</div><h1>Analytics<span className="heading-period">.</span></h1><p>Explore a sample view of parking activity.</p></div>
            </section>
            <section className="analytics-grid">
              <div className="panel analytics-card"><h2>Occupancy by hour</h2><p>Illustrative activity pattern</p><div className="chart-bars">{[28, 42, 36, 66, 82, 73, 48, 58, 31, 20, 38, 24].map((height, index) => <div key={index} className="chart-column"><span style={{ height: `${height}%` }} /><small>{index + 7}:00</small></div>)}</div></div>
              <div className="panel analytics-card"><h2>Peak period</h2><p>Sample time windows, not live sensor data</p><div className="peak-row"><span>Morning</span><strong>08:00 – 10:00</strong></div><div className="peak-row"><span>Afternoon</span><strong>13:00 – 15:00</strong></div><div className="peak-row"><span>Evening</span><strong>17:00 – 19:00</strong></div></div>
            </section>
          </>
        )}

        <footer className="footer">
          <span>© 2026 SmartPark</span>
          <span>SMART PARKING MANAGEMENT SYSTEM</span>
        </footer>
      </main>
    </div>
  );
}
