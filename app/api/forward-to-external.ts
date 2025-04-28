// pages/api/forward-to-external.ts

export async function POST(req: Request) {
    const jsonPayload = await req.json();
  
    const sendingPoint = 'https://movingrelogroup.org/receive-leads/receive.php';
    const headers = {
      'Authorization': 'Token token=buzzmoving2017',
      'Content-Type': 'application/json',
    };
  
    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(jsonPayload),
    };
  
    try {
      const externalResponse = await fetch(sendingPoint, requestOptions);
      const result = await externalResponse.json();
  
      if (!externalResponse.ok) {
        throw new Error('Failed to forward data to external API.');
      }
  
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  