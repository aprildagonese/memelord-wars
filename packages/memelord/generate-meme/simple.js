// Simple test function
async function main(args) {
  return {
    body: {
      success: true,
      message: "Function is working!",
      received_args: args,
      test_url: "https://i.imgflip.com/1bij.jpg"
    }
  };
}

exports.main = main;