/**
 * Mock d3 for testing
 * We don't need actual d3 functionality for unit tests
 */

export const select = () => ({
  append: () => ({}),
  attr: () => ({}),
  style: () => ({}),
  text: () => ({}),
  selectAll: () => ({
    data: () => ({
      enter: () => ({
        append: () => ({}),
      }),
    }),
  }),
});

export const scaleLinear = () => ({
  domain: () => ({
    range: () => ({}),
  }),
});

export const scaleTime = () => ({
  domain: () => ({
    range: () => ({}),
  }),
});

export const axisBottom = () => ({});
export const axisLeft = () => ({});

// Add other d3 functions as needed for tests
export default {
  select,
  scaleLinear,
  scaleTime,
  axisBottom,
  axisLeft,
};
