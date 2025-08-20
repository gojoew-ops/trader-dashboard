import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function StockChart() {
  const data = [
    { name: "9:30", price: 150 },
    { name: "10:00", price: 152 },
    { name: "10:30", price: 148 },
    { name: "11:00", price: 155 }
  ];

  return (
    <LineChart width={600} height={300} data={data}>
      <Line type="monotone" dataKey="price" stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </LineChart>
  );
}