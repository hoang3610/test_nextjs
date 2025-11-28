import ReactApexChart from "react-apexcharts";
interface FunnelChartProps<T> {
  chartData: T[];
  chartLabels: T[] | string[];
  chartCategories: T[] | string[];
  chartColors: T[] | string[];
  chartHeight: number;
  chartLoading: boolean;
  chartTitle?: string;
}

export const FunnelChart = <T,>(props: FunnelChartProps<T>) => {
  const salesByCategory: any = {
    series: props.chartData,
    options: {
      chart: {
        type: "bar",
        height: 350,
        dropShadow: {
          enabled: true,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: true,
          barHeight: "80%",
          isFunnel: true,
        },
      },
      colors: ["#62ACEA"],
      dataLabels: {
        enabled: true,
        formatter: function (val: any, opt: any) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        dropShadow: {
          enabled: true,
        },
      },
      title: {
        text: props.chartTitle,
        align: "middle",
      },
      xaxis: {
        categories: props.chartCategories,
      },
      legend: {
        show: false,
      },
    },
  };
  return (
    <div className="overflow-hidden bg-white rounded-lg dark:bg-black">
      {props.chartLoading ? (
        <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
          <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
        </div>
      ) : (
        <ReactApexChart
          series={salesByCategory.series}
          options={salesByCategory.options}
          type="bar"
          height={props.chartHeight}
        />
      )}
    </div>
  );
};
