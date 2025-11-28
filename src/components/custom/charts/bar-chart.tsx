import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import { IRootState } from "../../../store";
import { formatAmount } from "../../../utils/helpers";
import { format } from "path";
interface BarChartProps<T> {
  chartData: T[];
  chartColors: T[] | string[];
  chartCategories: T[] | string[] | number[];
  chartHeight: number;
  chartLoading: boolean;
}

export const BarChart = <T,>(props: BarChartProps<T>) => {
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode);

  const columnChart: any = {
    series: props.chartData,
    options: {
      chart: {
        height: 300,
        type: "bar",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      colors: props.chartColors,
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
        },
      },
      grid: {
        borderColor: isDark ? "#191e3a" : "#e0e6ed",
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: props.chartCategories,
        axisBorder: {
          color: isDark ? "#191e3a" : "#e0e6ed",
        },
        labels: {
          style: {
            cssClass: "apexcharts-xaxis-label",
          },
          trim: false,
          maxHeight: 200,
        },
      },
      yaxis: {
        opposite: false,
        labels: {
          offsetX: 0,
          maxWidth: 300,
          style: {
            cssClass: "apexcharts-yaxis-label",
          },
          trim: false,
          formatter: function (val: any) {
            return formatAmount(val + "");
          },
        },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: function (val: any) {
            return formatAmount(val + "");
          },
        },
      },
    },
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="overflow-hidden bg-white rounded-lg dark:bg-black">
        {props.chartLoading ? (
          <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
            <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
          </div>
        ) : (
          <ReactApexChart
            series={columnChart.series}
            options={columnChart.options}
            className="rounded-lg bg-white dark:bg-black overflow-hidden"
            type="bar"
            height={props.chartHeight}
            width="100%"
          />
        )}
      </div>
    </div>
  );
};
