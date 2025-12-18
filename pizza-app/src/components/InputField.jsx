export default function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label>{label}: </label>
      <input type={type} value={value} onChange={onChange} required />
    </div>
  );
}
