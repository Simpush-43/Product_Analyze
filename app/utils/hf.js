import dotenv from 'dotenv'
dotenv.config();
export async function queryHuggingFace(prompt){
  const HF_TOKEN = process.env.HF_TOKEN;
  try {
    const res = await fetch("https://router.huggingface.co/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        model:"meta-llama/Llama-3.2-3B-Instruct",
        messages:[{role:"user",content:prompt}],
        max_tokens:250
      }),
    });
    return res.json();
  } catch (error) {
    console.log("Error in fetch",error);
  }
}