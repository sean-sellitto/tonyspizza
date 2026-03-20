import PizzaOrderForm from "../components/PizzaOrderForm";
import TimesUpPage from "./TimesUpPage";
import { useState, useEffect, useCallback } from "react";
import { ensureTimeSlotInstancesForOrderDate, fetchNextOrderDate } from "../api/orderDates";
import { fetchTimeSlots } from "../api/timeSlots";
import { fetchMenuItems } from "../api/menu";
import {
  createGroupedOrder,
  releaseTimeslotReservation,
  reserveTimeslot,
} from "../api/orders";

function createLineItem(defaultMenuId = "") {
  return {
    id: crypto.randomUUID(),
    menu_item_id: defaultMenuId,
    quantity: 1,
    timeslot_id: "",
    reservation_id: null,
    reservation_expires_at: null,
    error: "",
  };
}

export default function PizzaOrderFormPage() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeOrderDateId, setActiveOrderDateId] = useState(null);
  const [activeOrderDateLabel, setActiveOrderDateLabel] = useState("");
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
  });
  const [lineItems, setLineItems] = useState([]);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [submitConflictSummary, setSubmitConflictSummary] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResetToken, setSuccessResetToken] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [nowMs, setNowMs] = useState(() => Date.now());

  // --- Ordering cutoff logic (temporarily disabled for active development) ---
  // const now = new Date();
  // const day = now.getDay(); // 0 = Sunday, 1 = Monday ... 5 = Friday
  // const hour = now.getHours();
  //
  // const orderingClosed =
  //   (day === 5 && hour >= 12) || // Friday after noon
  //   day === 6 || // Saturday
  //   day === 0 || // Sunday
  //   (day === 1 && hour < 8); // Monday before 8am
  const orderingClosed = false;

  const loadTimeSlots = useCallback(async (orderDateId = activeOrderDateId) => {
    const { data, error } = await fetchTimeSlots(orderDateId);
    if (!error && data.length > 0) {
      setTimeSlots(data);
    } else if (!error) {
      setTimeSlots([]);
    }
  }, [activeOrderDateId]);

  const loadNextOrderDate = useCallback(async () => {
    const { data, error } = await fetchNextOrderDate();
    if (!error && data?.id) {
      setActiveOrderDateId(data.id);
      const d = new Date(`${data.order_date}T00:00:00`);
      setActiveOrderDateLabel(
        `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`,
      );
      // Generate slot instances for this date if missing (e.g. new future date after previous passed).
      await ensureTimeSlotInstancesForOrderDate(data.id);
      await loadTimeSlots(data.id);
    } else if (!error) {
      setActiveOrderDateLabel("");
      await loadTimeSlots();
    }
  }, [loadTimeSlots]);

  const loadMenuItems = useCallback(async () => {
    const { data, error } = await fetchMenuItems();
    if (!error && data.length > 0) {
      setMenuItems(data);
      setLineItems((prev) =>
        prev.length
          ? prev
          : [
              {
                ...createLineItem(data[0].id),
                menu_item_id: data[0].id,
              },
            ],
      );
    }
  }, []);

  useEffect(() => {
    const initId = setTimeout(() => {
      loadNextOrderDate();
      loadMenuItems();
    }, 0);

    return () => clearTimeout(initId);
  }, [loadNextOrderDate, loadMenuItems]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const nextExpiringReservationMs = lineItems
    .map((item) =>
      item.reservation_expires_at ? new Date(item.reservation_expires_at).getTime() : null,
    )
    .filter(Boolean)
    .sort((a, b) => a - b)[0];

  const reservationCountdown =
    nextExpiringReservationMs && nextExpiringReservationMs > nowMs
      ? (() => {
          const totalSeconds = Math.floor((nextExpiringReservationMs - nowMs) / 1000);
          const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
          const seconds = String(totalSeconds % 60).padStart(2, "0");
          return `${minutes}:${seconds}`;
        })()
      : null;

  const onAddLineItem = () => {
    setMessage("");
    setSubmitConflictSummary([]);
    setLineItems((prev) => [
      ...prev,
      createLineItem(menuItems[0]?.id || ""),
    ]);
  };

  const onRemoveLineItem = async (lineItemId) => {
    setMessage("");
    setSubmitConflictSummary([]);
    const item = lineItems.find((line) => line.id === lineItemId);
    if (item?.reservation_id) {
      await releaseTimeslotReservation({
        reservation_id: item.reservation_id,
        session_id: sessionId,
      });
    }

    setLineItems((prev) => prev.filter((line) => line.id !== lineItemId));
    await loadTimeSlots();
  };

  const onLineItemChange = async (lineItemId, field, value) => {
    setMessage("");
    setSubmitConflictSummary([]);
    const targetBeforeChange = lineItems.find((line) => line.id === lineItemId);

    setLineItems((prev) =>
      prev.map((line) =>
        line.id === lineItemId ? { ...line, [field]: value, error: "" } : line,
      ),
    );

    if (field === "quantity") {
      if (targetBeforeChange?.timeslot_id) {
        await onLineItemSlotSelect(
          lineItemId,
          targetBeforeChange.timeslot_id,
          value,
          targetBeforeChange.reservation_id,
        );
      }
    }
  };

  const onLineItemSlotSelect = async (
    lineItemId,
    timeslotId,
    quantity,
    previousReservationIdOverride,
  ) => {
    setMessage("");
    setSubmitConflictSummary([]);
    const target = lineItems.find((line) => line.id === lineItemId);
    if (!timeslotId || !target) return;

    const { data, error } = await reserveTimeslot({
      timeslot_id: timeslotId,
      quantity,
      session_id: sessionId,
      previous_reservation_id:
        previousReservationIdOverride !== undefined
          ? previousReservationIdOverride
          : target.reservation_id,
    });

    if (error) {
      setLineItems((prev) =>
        prev.map((line) =>
          line.id === lineItemId ? { ...line, error: error || "Time slot unavailable." } : line,
        ),
      );
      await loadTimeSlots();
      return;
    }

    setLineItems((prev) =>
      prev.map((line) =>
        line.id === lineItemId
          ? {
              ...line,
              timeslot_id: timeslotId,
              quantity,
              reservation_id: data?.reservation_id ?? null,
              reservation_expires_at: data?.expires_at ?? null,
              error: "",
            }
          : line,
      ),
    );
    await loadTimeSlots();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!lineItems.length) {
      setMessage("Add at least one pizza item before checkout.");
      return;
    }

    const incompleteItem = lineItems.find(
      (item) => !item.menu_item_id || !item.timeslot_id || !item.quantity,
    );
    if (incompleteItem) {
      setMessage("Complete pizza, quantity, and timeslot for every line item.");
      return;
    }

    const payload = lineItems.map((item) => ({
      menu_item_id: item.menu_item_id,
      timeslot_id: item.timeslot_id,
      quantity: Number(item.quantity),
      reservation_id: item.reservation_id,
    }));

    setIsSubmitting(true);
    setSubmitConflictSummary([]);
    try {
      const { error } = await createGroupedOrder({
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email,
        items: payload,
        session_id: sessionId,
      });

      if (error) {
        setMessage(error);
        setSuccess(false);
        setSubmitConflictSummary(
          lineItems.map((item, index) => ({
            item: index + 1,
            pizza:
              menuItems.find((m) => String(m.id) === String(item.menu_item_id))?.name ||
              "Unknown pizza",
            slot:
              timeSlots.find((t) => String(t.id) === String(item.timeslot_id))?.slot ||
              "Unknown slot",
            note: "Recheck capacity or pick a different slot.",
          })),
        );
        return;
      }

      setMessage("");
      setSuccess(true);
      setFormData({
        customer_name: "",
        phone: "",
        email: "",
      });
      setLineItems([]);
      setSubmitConflictSummary([]);
      setSuccessResetToken((prev) => prev + 1);
      await loadTimeSlots(); // refresh available slots
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Tony's Pizza Order Form</h1>
        <p>Fresh pizza. Limited slots. Order now.</p>
      </header>

      <main className="card">
        {orderingClosed ? (
          <TimesUpPage />
        ) : (
          <>
            <section className="info-section ordering-instructions">
              <h2>🍕 How Ordering Works</h2>
              <ul>
                <li>
                  Each time slot can handle up to{" "}
                  <strong>2 pizzas total</strong>
                </li>
                <li>
                  You can add <strong>multiple pizzas</strong> in one checkout
                </li>
                <li>
                  Each line item can use a <strong>different pickup slot</strong>
                </li>
                <li>Availability updates in real time</li>
                <li>
                  Selecting a slot starts a <strong>3-minute hold</strong> while
                  you review and submit
                </li>
              </ul>

              <h3>🕒 Choosing a Time Slot</h3>
              <ul>
                <li>
                  <strong>2 spots left</strong> → order 1 or 2 pizzas
                </li>
                <li>
                  <strong>1 spot left</strong> → order 1 pizza only
                </li>
                <li>
                  <strong>Sold out</strong> → slot unavailable
                </li>
                <li>
                  If a slot changes before submit, you will be asked to
                  <strong> pick a different slot</strong>
                </li>
              </ul>
            </section>
            <section className="info-section payment-info">
              <h2>💳 Payment Information</h2>
              <ul>
                <li>
                  <strong> Each pizza is $20</strong>
                </li>
                <li>
                  Payment is accepted via <strong>Venmo</strong> or{" "}
                  <strong>cash</strong>
                </li>
                <li>
                  <strong>Venmo:</strong> @Tony-Ratliff-3
                </li>
                <li>
                  Please include your <strong>name and time slot</strong> in the
                  Venmo note
                </li>
                <li>
                  <strong>Cash</strong> accepted at pickup
                </li>
              </ul>
            </section>

            <section className="info-section pizza-description">
              <h2>🍕 Our Pizzas</h2>

              <p>
                All pizzas are made with one ingredient organic flour, olive oil
                shipped from a one source organic farm in Italy, the same sauce
                and cheese that only the best pizza joints in NYC use.
              </p>

              <ul>
                <li>
                  <strong>Cheese</strong> – Classic cheese pizza
                </li>
                <li>
                  <strong>Pepperoni</strong> – Cup and char pepperoni with hot
                  honey sauce
                </li>
                <li>
                  <strong>Pepperoni, Sausage, Bananna Peppers</strong> – Cup and
                  char pepperoni, sausage, and banana peppers with hot honey
                  sauce
                </li>
                <li>
                  <strong>Supreme</strong> – Flavor bomb of finely chopped
                  pepperoni, onion, green pepper, and sausage combined to make
                  one bold flavor.
                </li>
              </ul>
            </section>

            <PizzaOrderForm
              formData={formData}
              setFormData={setFormData}
              lineItems={lineItems}
              timeSlots={timeSlots}
              menuItems={menuItems}
              onSubmit={handleSubmit}
              onAddLineItem={onAddLineItem}
              onRemoveLineItem={onRemoveLineItem}
              onLineItemChange={onLineItemChange}
              onLineItemSlotSelect={onLineItemSlotSelect}
              reservationCountdown={reservationCountdown}
              isSubmitting={isSubmitting}
              activeOrderDateLabel={activeOrderDateLabel}
              submitConflictSummary={submitConflictSummary}
              successResetToken={successResetToken}
              backendMessage={message}
            />
          </>
        )}
      </main>

      {success && (
        <div className="success-box">
          <h2>🎉 Order Confirmed!</h2>
          <p>Your pizza is being prepared.</p>
        </div>
      )}
    </div>
  );
}
