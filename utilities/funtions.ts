export default class Functions {
  public filterCurl(data: any | undefined) {
    return data?.map(
      (obj: { [x: string]: any; curVal: any; points: [[{ curVal: any }]] }) => {
        obj.points?.map(e => {
          e.map(e => {
            return 0;
          });
          return 0;
        });
        if (
          typeof obj.curVal === 'object' &&
          Object.prototype.hasOwnProperty.call(obj.curVal, '_kind')
        ) {
          const { curVal, ...rest } = obj;
          return { ...rest, curVal: 'N/A' };
        }
        return obj;
      }
    );
  }

  public getStyles() {
    const BLUE_COLOR = '#00a3de';
    const RED_COLOR = '#7c270b';

    return {
      parent: {
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        padding: 0,
        flex: 1
      },
      title: {
        textAnchor: 'start',
        verticalAnchor: 'end',
        fill: '#000000',
        fontFamily: 'inherit',
        fontSize: '18px',
        fontWeight: 'bold'
      },
      labelNumber: {
        textAnchor: 'middle',
        fill: '#ffffff',
        fontFamily: 'inherit',
        fontSize: '14px'
      },

      // INDEPENDENT AXIS
      axisYears: {
        axis: { stroke: 'black', strokeWidth: 1 },
        ticks: {
          size: ({ tick }: any) => {
            const tickSize = tick.getFullYear() % 10 === 0 ? 10 : 5;
            return tickSize;
          },
          stroke: 'black',
          strokeWidth: 1
        },
        tickLabels: {
          fill: 'black',
          fontFamily: 'inherit',
          fontSize: 16
        }
      },

      // DATA SET ONE
      axisOne: {
        grid: {
          stroke: ({ tick }: any) => (tick === -10 ? 'transparent' : '#6e6969'),
          strokeWidth: 1
        },
        axis: { stroke: BLUE_COLOR, strokeWidth: 0 },
        ticks: { strokeWidth: 0 },
        tickLabels: {
          fill: BLUE_COLOR,
          fontFamily: 'inherit',
          fontSize: 16
        }
      },
      labelOne: {
        fill: BLUE_COLOR,
        fontFamily: 'inherit',
        fontSize: 12,
        fontStyle: 'italic'
      },
      lineOne: {
        data: { stroke: BLUE_COLOR, strokeWidth: 1.5 }
      },
      axisOneCustomLabel: {
        fill: BLUE_COLOR,
        fontFamily: 'inherit',
        fontWeight: 300,
        fontSize: 21
      },

      // DATA SET TWO
      axisTwo: {
        axis: { stroke: RED_COLOR, strokeWidth: 0 },
        tickLabels: {
          fill: RED_COLOR,
          fontFamily: 'inherit',
          fontSize: 16
        }
      },
      labelTwo: {
        textAnchor: 'end',
        fill: RED_COLOR,
        fontFamily: 'inherit',
        fontSize: 12,
        fontStyle: 'italic'
      },
      lineTwo: {
        data: { stroke: RED_COLOR, strokeWidth: 4.5 }
      },

      // HORIZONTAL LINE
      lineThree: {
        data: { stroke: '#e95f46', strokeWidth: 2 }
      },
      test: {
        background: { fill: 'white' }
      }
    };
  }

  public getObjectFiltered(chartSupply: any) {
    let label = '';

    const obj = [{ x: new Date('2022-04-04T23:58:00-04:00'), y: 0 }];
    const array = [new Date('2022-04-04T23:58:00-04:00')];

    let major = 0;
    const newObj = [{ x: new Date('2022-04-04T23:58:00-04:00'), y: 0 }];
    if (chartSupply !== undefined) {
      chartSupply?.map((e: any, i: any) => {
        const last: string = e.v0.charAt(e.v0.length - 1).toString();
        const first: string = e.v0.charAt(0).toString();
        const door: string = e.v0;

        if (typeof parseFloat(last) === 'number') {
          const val = parseFloat(e.v0);
          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }

        if (last === 'A') {
          label = 'A';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));
          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }

        if (last === 'l') {
          label = 'gal';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));
          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }
        if (last === 'm') {
          label = 'ppm';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));
          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }

        if (last === 'k') {
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));
          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }
          if (first === 'N') {
            label = '';
          } else {
            label = '';
          }

          newObj[i] = {
            x: new Date(e.ts?.val ? e.ts?.val : ''),
            y: e.v0
          };
        }

        if (last === 'f' || last === 'n') {
          newObj[i] = {
            x: new Date(e.ts?.val ? e.ts?.val : ''),
            y: e.v0
          };
        }
        if (door === 'Open' || door === 'Closed') {
          newObj[i] = {
            x: new Date(e.ts?.val ? e.ts?.val : ''),
            y: e.v0
          };
        }
        if (last === 'F') {
          label = 'ºF';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));
          major = 100;
          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }

        if (last === 'i') {
          label = 'psi';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));

          major = 350;

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }

        if (last === '%') {
          label = '%';
          const val = parseFloat(e.v0.slice(0, e.v0.length - 1));

          if (major === 0) {
            major = val;
          }
          if (val > major) {
            major = val;
          }

          newObj[i] = { x: new Date(e.ts?.val ? e.ts?.val : ''), y: val };
        }
        return 0;
      });

      newObj
        ?.filter(e => e !== undefined)
        .map((e, i) => {
          obj[i] = { x: e.x, y: e.y };

          array[i] = new Date(e.x);

          return 0;
        });

      obj.shift();
    }
    return { obj, label };
  }
}
