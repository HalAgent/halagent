export const CheckIsMobile = () => {
  return /android|avantgo|blackberry|iphone|ipad|ipod|opera mini|palm|silk|windows phone|iemobile/i.test(navigator.userAgent);
};

export const formatTimeDifference = (timestampString: string) => {
  if (/[^0-9]/.test(timestampString)) {
    return timestampString; // not numberic
  }

  // Get the current time's timestamp
  const now = Date.now();

  let timestamp;

  try {
    // Try to convert the provided timestamp string to a number
    timestamp = parseInt(timestampString, 10);
    // If parseInt fails and returns NaN, we should catch that
    if (isNaN(timestamp)) {
      return timestampString;
      //throw new Error('Invalid timestamp');
    }
  } catch (error) {
    // If there's an error (e.g., invalid timestamp), return the original string
    return timestampString;
  }

  // Calculate the time difference in milliseconds
  const timeDifference = now - timestamp;

  // Get the difference in seconds
  const seconds = Math.floor(timeDifference / 1000);

  // Determine the appropriate unit for the time difference
  if (seconds < 60) {
    // Less than 1 minute
    return `About ${seconds} seconds ago`;
  } else if (seconds < 3600) {
    // Less than 1 hour
    const minutes = Math.floor(seconds / 60);
    return `About ${minutes} mins ago`;
  } else if (seconds < 86400) {
    // Less than 24 hours
    const hours = Math.floor(seconds / 3600);
    return `About ${hours} hours ago`;
  } else {
    // More than 24 hours, format date and time
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    };

    // Format the date in "YYYY-MM-DD HH:mm:ss"
    const formattedDate = date.toLocaleString('en-US', options).replace(',', '').replace(/\//g, '-');
    return formattedDate;
  }
};
