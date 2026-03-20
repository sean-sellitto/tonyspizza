import { useEffect, useMemo, useState } from "react";
import { fetchOrders, normalizePaymentStatus, setCheckoutPaymentStatus } from "../api/orders";
import {
  createOrderDate,
  deleteOrderDate,
  fetchOrderDatesAdmin,
  updateOrderDate,
} from "../api/orderDates";

export default function AdminOrdersPage() {
  const [orderGroups, setOrderGroups] = useState([]);
  const [orderDates, setOrderDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDatesLoading, setIsDatesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderDateFilter, setOrderDateFilter] = useState("all");
  const [newOrderDate, setNewOrderDate] = useState("");
  const [datesMessage, setDatesMessage] = useState("");
  const [datesError, setDatesError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await fetchOrders();
    setOrderGroups(data);
    setIsLoading(false);
  };

  const loadOrderDates = async () => {
    setIsDatesLoading(true);
    const { data, error } = await fetchOrderDatesAdmin();
    if (error) {
      setDatesError(error.message || "Could not load pizza making dates.");
      setOrderDates([]);
    } else {
      setOrderDates(data);
    }
    setIsDatesLoading(false);
  };

  useEffect(() => {
    loadOrders();
    loadOrderDates();
  }, []);

  const orderDateOptions = useMemo(() => {
    const dates = [];
    for (const g of orderGroups) {
      for (const line of g.lines) {
        if (line.order_date) dates.push(line.order_date);
      }
    }
    return Array.from(new Set(dates)).sort((a, b) => new Date(a) - new Date(b));
  }, [orderGroups]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    return orderGroups.filter((g) => {
      const payment = normalizePaymentStatus(g.status);
      const statusMatch = statusFilter === "all" || payment === statusFilter;
      const orderDateMatch =
        orderDateFilter === "all" ||
        g.lines.some((l) => l.order_date === orderDateFilter);
      const searchMatch =
        !normalizedSearch ||
        (g.customer_name || "").toLowerCase().includes(normalizedSearch) ||
        (g.phone || "").toLowerCase().includes(normalizedSearch) ||
        (g.email || "").toLowerCase().includes(normalizedSearch) ||
        g.lines.some(
          (l) =>
            (l.menu_item_name || "").toLowerCase().includes(normalizedSearch) ||
            (l.timeslot_slot || "").toLowerCase().includes(normalizedSearch),
        );
      return statusMatch && orderDateMatch && searchMatch;
    });
  }, [orderGroups, statusFilter, orderDateFilter, normalizedSearch]);

  const totalPizzas = filteredGroups.reduce((sum, g) => sum + (g.pizza_count || 0), 0);

  const handlePaymentChange = async (g, line, nextValue) => {
    setPaymentError("");
    const { error } = g.parent_order_id
      ? await setCheckoutPaymentStatus({
          status: nextValue,
          parentOrderId: g.parent_order_id,
        })
      : await setCheckoutPaymentStatus({
          status: nextValue,
          orderLineId: line.id,
        });
    if (error) {
      setPaymentError(error);
      return;
    }
    await loadOrders();
  };

  const handleCreateDate = async (e) => {
    e.preventDefault();
    if (!newOrderDate) {
      setDatesError("Select a date first.");
      return;
    }
    setDatesError("");
    setDatesMessage("");
    const { error } = await createOrderDate({ order_date: newOrderDate, is_active: true });
    if (error) {
      setDatesError(error.message || "Could not add date.");
      return;
    }
    setDatesMessage("Pizza making date added.");
    setNewOrderDate("");
    await loadOrderDates();
  };

  const handleDateChange = async (id, nextDate) => {
    setDatesError("");
    setDatesMessage("");
    const { error } = await updateOrderDate({ id, order_date: nextDate });
    if (error) {
      setDatesError(error.message || "Could not update date.");
      return;
    }
    setDatesMessage("Pizza making date updated.");
    await loadOrderDates();
    await loadOrders();
  };

  const handleToggleActive = async (id, isActive) => {
    setDatesError("");
    setDatesMessage("");
    const { error } = await updateOrderDate({ id, is_active: isActive });
    if (error) {
      setDatesError(error.message || "Could not update active status.");
      return;
    }
    setDatesMessage("Date status updated.");
    await loadOrderDates();
  };

  const handleDeleteDate = async (id) => {
    setDatesError("");
    setDatesMessage("");
    const { error } = await deleteOrderDate(id);
    if (error) {
      setDatesError(
        error.message || "Could not delete date. It may still be linked to existing slots/orders.",
      );
      return;
    }
    setDatesMessage("Pizza making date deleted.");
    await loadOrderDates();
    await loadOrders();
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Admin Orders Dashboard</h1>
        <p>Track placed orders and pickup details</p>
      </header>

      <main className="card">
        <section className="admin-dates-panel" aria-label="Manage pizza making dates">
          <div className="section-header">
            <h3>Pizza Making Dates</h3>
            <p>Dates added here control which order dates are available to customers.</p>
          </div>
          <form className="admin-date-create-form" onSubmit={handleCreateDate}>
            <div className="admin-toolbar-field">
              <label htmlFor="new-order-date">Add Date</label>
              <input
                id="new-order-date"
                type="date"
                value={newOrderDate}
                onChange={(e) => setNewOrderDate(e.target.value)}
              />
            </div>
            <button type="submit">Add Date</button>
          </form>
          {datesMessage && <p className="admin-feedback success">{datesMessage}</p>}
          {datesError && <p className="admin-feedback error">{datesError}</p>}
          {isDatesLoading ? (
            <p className="admin-empty-state">Loading dates...</p>
          ) : orderDates.length === 0 ? (
            <p className="admin-empty-state">No pizza making dates configured.</p>
          ) : (
            <div className="admin-dates-list">
              {orderDates.map((dateRow) => (
                <div key={dateRow.id} className="admin-date-row">
                  <input
                    type="date"
                    value={dateRow.order_date}
                    onChange={(e) => handleDateChange(dateRow.id, e.target.value)}
                  />
                  <label className="admin-date-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(dateRow.is_active)}
                      onChange={(e) => handleToggleActive(dateRow.id, e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleDeleteDate(dateRow.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-summary-grid" aria-label="Order summary">
          <div className="admin-summary-card">
            <p>Visible checkouts</p>
            <strong>{filteredGroups.length}</strong>
          </div>
          <div className="admin-summary-card">
            <p>Total Pizzas</p>
            <strong>{totalPizzas}</strong>
          </div>
        </section>
        <section className="admin-toolbar" aria-label="Admin filters">
          <div className="admin-toolbar-field">
            <label htmlFor="orders-search">Search</label>
            <input
              id="orders-search"
              type="text"
              placeholder="Name, phone, pizza, timeslot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-toolbar-field">
            <label htmlFor="orders-status-filter">Payment</label>
            <select
              id="orders-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="admin-toolbar-field">
            <label htmlFor="orders-date-filter">Order Date</label>
            <select
              id="orders-date-filter"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
            >
              <option value="all">All dates</option>
              {orderDateOptions.map((dateValue) => (
                <option key={dateValue} value={dateValue}>
                  {new Date(`${dateValue}T00:00:00`).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </section>
        {paymentError && (
          <p className="admin-feedback error" role="alert">
            {paymentError}
          </p>
        )}
        {isLoading ? (
          <p className="admin-empty-state">Loading orders...</p>
        ) : filteredGroups.length === 0 ? (
          <p className="admin-empty-state">No matching orders found.</p>
        ) : (
          <table className="admin-orders-table admin-orders-flat">
            <thead>
              <tr>
                <th>Order date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Pizza</th>
                <th>Qty</th>
                <th>Timeslot</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.flatMap((g) =>
                g.lines.map((line) => {
                  const paymentValue = g.parent_order_id
                    ? normalizePaymentStatus(g.status)
                    : normalizePaymentStatus(line.status);
                  return (
                    <tr key={`${g.group_key}-${line.id}`} className="admin-order-line-row">
                      <td className="cell-date">
                        {line.order_date
                          ? new Date(`${line.order_date}T00:00:00`).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="cell-name">{g.customer_name}</td>
                      <td className="cell-phone">{g.phone}</td>
                      <td className="cell-pizza">{line.menu_item_name}</td>
                      <td className="cell-qty">{line.quantity}</td>
                      <td className="cell-slot">{line.timeslot_slot}</td>
                      <td className="cell-status">
                        <select
                          className="admin-payment-select"
                          aria-label="Payment status"
                          value={paymentValue}
                          onChange={(e) => handlePaymentChange(g, line, e.target.value)}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
