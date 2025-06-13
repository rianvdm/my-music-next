'use client';

import { memo } from 'react';

const DayGreeting = memo(() => {
  const options = { weekday: 'long' };
  const dayName = new Intl.DateTimeFormat('en-US', options).format(new Date());
  return <h1>Happy {dayName}, friend!</h1>;
});

DayGreeting.displayName = 'DayGreeting';

export default DayGreeting;
