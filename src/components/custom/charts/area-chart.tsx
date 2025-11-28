import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import { IRootState } from "../../../store";
import { formatAmount } from "../../../utils/helpers";
interface AreaChartProps<T> {
  chartData?: T[];
  chartColors: T[] | string[];
  chartLabels: T[] | string[];
  chartHeight: number;
  chartLoading: boolean;
}

export const AreaChart = <T,>(props: AreaChartProps<T>) => {
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode);
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl" ? true : false;

  const columnChart: any = {
    series: props.chartData,
    options: {
      chart: {
        height: 325,
        type: "area",
        fontFamily: "Nunito, sans-serif",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },

      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
        lineCap: "square",
      },
      dropShadow: {
        enabled: true,
        opacity: 0.2,
        blur: 10,
        left: -7,
        top: 22,
      },
      colors: props.chartColors,
      markers: {
        discrete: [
          {
            seriesIndex: 0,
            dataPointIndex: 6,
            fillColor: "#1B55E2",
            strokeColor: "transparent",
            size: 7,
          },
          {
            seriesIndex: 1,
            dataPointIndex: 5,
            fillColor: "#E7515A",
            strokeColor: "transparent",
            size: 7,
          },
        ],
      },
      labels: props.chartLabels,
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        labels: {
          offsetX: isRtl ? 2 : 0,
          offsetY: 5,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-xaxis-title",
          },
        },
      },
      yaxis: {
        tickAmount: 7,
        labels: {
          formatter: (value: number) => {
            return formatAmount(value + "") ;
          },
          offsetX: isRtl ? -30 : -10,
          offsetY: 0,
          style: {
            fontSize: "12px",
            cssClass: "apexcharts-yaxis-title",
          },
        },
        opposite: isRtl ? true : false,
      },
      grid: {
        borderColor: isDark ? "#191E3A" : "#E0E6ED",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      // legend: {
      //   position: "top",
      //   horizontalAlign: "right",
      //   fontSize: "16px",
      //   markers: {
      //     width: 10,
      //     height: 10,
      //     offsetX: -2,
      //   },
      //   itemMargin: {
      //     horizontal: 10,
      //     vertical: 5,
      //   },
      // },
      tooltip: {
        marker: {
          show: true,
        },
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: !1,
          opacityFrom: isDark ? 0.19 : 0.28,
          opacityTo: 0.05,
          stops: isDark ? [100, 100] : [45, 100],
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
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
            type="area"
            height={props.chartHeight}
          />
        )}
      </div>
    </div>
  );
};
