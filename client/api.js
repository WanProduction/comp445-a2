const apiURL = ''

const sendSegmentToServer = async (segment) => {
    const response = await fetch(`${apiURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: segment
    });
  
    if (!response.ok) {
      throw new Error(`Failed to upload video segment: ${response.status} ${response.statusText}`);
    }
  };
  