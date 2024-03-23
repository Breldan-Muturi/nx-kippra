export async function POST(req: Request) {
  const paymentDetails = await req.json();
  console.log(JSON.stringify(paymentDetails));
}
