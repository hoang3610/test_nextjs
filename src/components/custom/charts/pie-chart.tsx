import ReactApexChart from "react-apexcharts";
import { formatAmount } from "../../../utils/helpers";
interface PieChatProps<T> {
  chartData: T[];
  chartLabels: T[] | string[];
  chartColors: T[] | string[];
  chartHeight: number;
  chartLoading: boolean;
  chartPosition?: "left" | "right" | "top" | "bottom";
}

export const PieChat = <T,>(props: PieChatProps<T>) => {
  const salesByCategory: any = {
    series: props.chartData,
    options: {
      chart: {
        type: "pie",
        height: 1000,
        fontFamily: "Roboto, sans-serif",
      },
      dataLabels: {
        enabled: true,
        formatter: (val: any) => `${val.toFixed(2)}%`,
        style: {
          colors: ["#fff"],
          fontWeight: 600,
          fontSize: "14px",
        },

        dropShadow: {
          enabled: false,
        },
      },

      stroke: {
        show: false,
      },
      colors: props.chartColors,

      legend: {
        show: true,
        position: props.chartPosition || "bottom",
        horizontalAlign: "center",
        floating: false,
        fontSize: "14px",
        fontFamily: "Roboto, sans-serif",
        offsetY: 8,
        markers: {
          width: 8,
          height: 8,
          radius: 12,
          offsetX: -3,
        },

        formatter: function (seriesName: any, opts: any) {
          const value = opts.w.globals.seriesTotals[opts.seriesIndex];
          const totalPercent = (value / opts.w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0)) * 100;
          return `<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <label style="margin-right: 16px; margin-bottom: 0px">${seriesName}</label>
                        <span style="color:${props.chartColors[opts.seriesIndex]
            }; margin-left: auto;">${totalPercent.toFixed(2)}%</span>
                    </div>`;
        },
        style: {
          colors: props.chartColors,
          fontWeight: 600,
          fontSize: "12px",
          with: "100%",
          backgroundColor: "#161d31",
        },
        itemMargin: {
          horizontal: 10,
          vertical: 8,
        },
        onItemClick: {
          toggleDataSeries: true,
        },
        onItemHover: {
          highlightDataSeries: true,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "0%",
            background: "transparent",
            labels: {
              show: false,
            },
          },
        },
      },
      labels: props.chartLabels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 500,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      tooltip: {
        enabled: true,
        style: {
          fontSize: "14px",
          fontFamily: "Roboto, sans-serif",
        },
        y: {
          formatter: function (val: any) {
            return formatAmount(val + "");
          },
        },
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
          type="donut"
          height={props.chartHeight}
        />
      )}
    </div>
  );
};
