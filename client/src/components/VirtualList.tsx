import { ReactNode, UIEvent, useMemo, useState } from 'react';

type Measurement = {
  top: number;
  height: number;
};

type Props<T> = {
  items: T[];
  getItemSize: (item: T, index: number) => number;
  className?: string;
  overscan?: number;
  getKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
};

function buildMeasurements<T>(
  items: T[],
  getItemSize: (item: T, index: number) => number,
) {
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
}

function getTotalHeight(measurements: Measurement[]) {
  const lastMeasurement =
    measurements[measurements.length - 1];

  return lastMeasurement
    ? lastMeasurement.top + lastMeasurement.height
    : 0;
}

function getVisibleRange({
  itemCount,
  measurements,
  overscan,
  scrollTop,
  viewportHeight,
}: {
  itemCount: number;
  measurements: Measurement[];
  overscan: number;
  scrollTop: number;
  viewportHeight: number;
}) {
  const firstVisibleIndex = measurements.findIndex(
    measurement =>
      measurement.top + measurement.height >= scrollTop,
  );
  const firstHiddenIndex = measurements.findIndex(
    measurement =>
      measurement.top > scrollTop + viewportHeight,
  );

  return {
    start: Math.max(0, firstVisibleIndex - overscan),
    end:
      firstHiddenIndex === -1
        ? itemCount
        : Math.min(itemCount, firstHiddenIndex + overscan),
  };
}

export function VirtualList<T>({
  items,
  getItemSize,
  className,
  overscan = 4,
  getKey,
  renderItem,
}: Props<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const [viewportHeight, setViewportHeight] = useState(
    window.innerHeight,
  );

  const measurements = useMemo(
    () => buildMeasurements(items, getItemSize),
    [getItemSize, items],
  );

  const totalHeight = getTotalHeight(measurements);

  const range = useMemo(() => {
    return getVisibleRange({
      itemCount: items.length,
      measurements,
      overscan,
      scrollTop,
      viewportHeight,
    });
  }, [
    items.length,
    measurements,
    overscan,
    scrollTop,
    viewportHeight,
  ]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    setViewportHeight(event.currentTarget.clientHeight);
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
