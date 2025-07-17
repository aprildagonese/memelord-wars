const MEME_TEMPLATES = {
  'Drake Hotline Bling': { id: '181913649', boxes: 2 },
  'Distracted Boyfriend': { id: '112126428', boxes: 2 },
  'Two Buttons': { id: '87743020', boxes: 2 },
  'Change My Mind': { id: '129242436', boxes: 2 },
  'Batman Slapping Robin': { id: '438680', boxes: 2 },
  'UNO Draw 25 Cards': { id: '217743513', boxes: 2 },
  'One Does Not Simply': { id: '61579', boxes: 2 },
  'Expanding Brain': { id: '93895088', boxes: 4 },
  'Waiting Skeleton': { id: '4087833', boxes: 2 },
  'Mocking Spongebob': { id: '102156234', boxes: 2 },
  'Disaster Girl': { id: '97984', boxes: 2 },
  'Woman Yelling At Cat': { id: '188390779', boxes: 2 },
  'X, X Everywhere': { id: '91538330', boxes: 2 },
  'Ancient Aliens': { id: '101470', boxes: 2 },
  'Buff Doge vs. Cheems': { id: '247375501', boxes: 4 },
  "Gru's Plan": { id: '131940431', boxes: 4 },
  'Roll Safe Think About It': { id: '89370399', boxes: 2 },
  'Bernie I Am Once Again Asking For Your Support': { id: '222403160', boxes: 2 },
  'Epic Handshake': { id: '135256802', boxes: 2 },
  'Hide the Pain Harold': { id: '27813981', boxes: 2 },
  'Monkey Puppet': { id: '148909805', boxes: 2 },
  'Always Has Been': { id: '252600902', boxes: 2 },
  'This Is Fine': { id: '55311130', boxes: 2 },
  'Success Kid': { id: '61544', boxes: 2 }
};

async function main(args) {
  try {
    // Handle both direct params and nested structure
    const template = args.template || args.meme_template || 'Drake Hotline Bling';
    const text = args.text || args.meme_text || ['Default', 'Text'];
    
    if (!template || !text) {
      return {
        body: {
          success: false,
          error: 'Missing required parameters: template and text'
        }
      };
    }
    
    const templateConfig = MEME_TEMPLATES[template] || MEME_TEMPLATES['Drake Hotline Bling'];
    
    const params = new URLSearchParams({
      template_id: templateConfig.id,
      username: process.env.IMGFLIP_USERNAME,
      password: process.env.IMGFLIP_PASSWORD
    });

    // Add text for each box
    for (let i = 0; i < Math.min(text.length, templateConfig.boxes); i++) {
      params.append(`text${i}`, text[i] || '');
    }

    // Fill remaining boxes with empty strings if needed
    for (let i = text.length; i < templateConfig.boxes; i++) {
      params.append(`text${i}`, '');
    }

    const response = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        body: {
          success: true,
          image_url: data.data.url,
          template: template,
          boxes_used: Math.min(text.length, templateConfig.boxes)
        }
      };
    } else {
      return {
        body: {
          success: false,
          error: data.error_message || 'Unknown Imgflip error'
        }
      };
    }
  } catch (error) {
    return {
      body: {
        success: false,
        error: error.message
      }
    };
  }
}

exports.main = main;