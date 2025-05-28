export default function Header({ title }) {
  return (
    <div className="w-full p-4 bg-white shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </div>
  );
}