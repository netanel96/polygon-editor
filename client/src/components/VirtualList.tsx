import { ReactNode, UIEvent, useMemo, useState } from 'react';

type Props<T> = {
  items: T[];
  getItemSize: (item: T, index: number) => number;
  className?: string;
  overscan?: number;
  getKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
};

export function VirtualList<T>({
  items,
  getItemSize,
  className,
  overscan = 4,
  getKey,
  renderItem,
}: Props<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const measurements = useMemo(() => {
    let top = 0;

    return items.map((item, index) => {
      const height = getItemSize(item, index);
      const measurement = {
        top,
        height,
      };

      top += height;

      return measurement;
    });
  }, [getItemSize, items]);

  const totalHeight =
    measurements.length === 0
      ? 0
      : measurements[measurements.length - 1].top +
        measurements[measurements.length - 1].height;

  const range = useMemo(() => {
    const viewportHeight = window.innerHeight;
    const start = Math.max(
      0,
      measurements.findIndex(
        measurement =>
          measurement.top + measurement.height >= scrollTop,
      ) - overscan,
    );
    const end =
      measurements.findIndex(
        measurement =>
          measurement.top >
          scrollTop + viewportHeight,
      );

    return {
      start,
      end:
        end === -1
          ? items.length
          : Math.min(items.length, end + overscan),
    };
  }, [items.length, measurements, overscan, scrollTop]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    setScrollTop(event.currentTarget.scrollTop);
  }

  return (
    <div className={className} onScroll={handleScroll}>
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {items.slice(range.start, range.end).map((item, offset) => {
          const index = range.start + offset;
          const measurement = measurements[index];

          return (
            <div
              key={getKey(item, index)}
              style={{
                height: measurement.height,
                left: 0,
                position: 'absolute',
                right: 0,
                top: measurement.top,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
