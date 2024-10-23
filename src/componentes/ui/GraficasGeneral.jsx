import React, { useMemo } from "react";
import {
  BarChart,
  PieChart,
  LineChart,
  Bar,
  Pie,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
  Cell,
  Brush,
} from "recharts";
import { Typography } from "antd";

const { Title } = Typography;

// Función para generar un color aleatorio en formato hexadecimal
const getRandomColor = () => {
  const minBrightness = 50; // Ajusta este valor para controlar qué tan oscuros serán los colores como mínimo
  const maxBrightness = 200; // Ajusta este valor para controlar qué tan claros serán los colores como máximo

  const r = Math.floor(
    Math.random() * (maxBrightness - minBrightness) + minBrightness
  );
  const g = Math.floor(
    Math.random() * (maxBrightness - minBrightness) + minBrightness
  );
  const b = Math.floor(
    Math.random() * (maxBrightness - minBrightness) + minBrightness
  );

  return `rgb(${r}, ${g}, ${b})`;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      stroke="black"
      strokeWidth="3"
      paintOrder="stroke"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const GraficasGeneral = ({
  title,
  titleColor = "white",
  data,
  type,
  xDataKey,
  yDataKey,
  width = "100%",
  height = 300,
  xAxisProps = {},
  yAxisProps = {},
  barProps = {},
  pieProps = {},
  lineProps = {},
  activeBarProps = {},
}) => {
  // Genera colores aleatorios basados en la cantidad de datos
  const randomColors = useMemo(() => {
    return data.map(() => getRandomColor());
  }, [data]);

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            {/*<Legend verticalAlign="bottom"/>*/}
            {/*<Brush dataKey="name" height={30} stroke="#8884d8" />*/}
            <Bar
              label={{ position: "center", fill: "white" }}
              dataKey={yDataKey}
              fill="#8884d8"
              {...barProps}
              activeBar={
                activeBarProps ? <Rectangle {...activeBarProps} /> : undefined
              }
            />
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey={yDataKey}
              nameKey={xDataKey}
              fill="#8884d8"
              {...pieProps}
              //label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={randomColors[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={yDataKey}
              stroke="#8884d8"
              {...lineProps}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xDataKey} {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke="#8884d8"
              {...lineProps}
            />
          </AreaChart>
        );
      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  return (
    <div
      style={{
        width: width,
        height: height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {title && (
        <Title
          level={3}
          style={{
            color: titleColor,
            marginBottom: "10px",
          }}
        >
          {title}
        </Title>
      )}
      <div style={{ width: "100%", height: "calc(100% - 40px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficasGeneral;
