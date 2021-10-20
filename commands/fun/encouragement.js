const { del } = require("../../functions.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "encouragement",
    aliases: ["encourage", "inspiration", "inspire"],
    category: "fun",
    description: "Says a random form of encouragement.",
    permissions: "member",
    run: (client, message, args) => {
        var inspirationalMessages =
            [
                "Act as if what you do makes a difference. It does. --William James",
                "Success is not final, failure is not fatal: it is the courage to continue that counts. --Winston Churchill",
                "Never bend your head. Always hold it high. Look the world straight in the eye. --Helen Keller",
                "What you get by achieving your goals is not as important as what you become by achieving your goals. --Zig Ziglar",
                "Believe you can and you're halfway there. --Theodore Roosevelt",
                "When you have a dream, you've got to grab it and never let go. --Carol Burnett",
                "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. --Jimmy Dean",
                "No matter what you're going through, there's a light at the end of the tunnel. --Demi Lovato",
                "It is our attitude at the beginning of a difficult task which, more than anything else, will affect its successful outcome. --William James",
                "Life is like riding a bicycle. To keep your balance, you must keep moving. --Albert Einstein",
                "Just don't give up trying to do what you really want to do. Where there is love and inspiration, I don't think you can go wrong. --Ella Fitzgerald",
                "Limit your \"always\" and your \"nevers.\" --Amy Poehler",
                "Nothing is impossible. The word itself says \"I'm possible!\" --Audrey Hepburn",
                "You are never too old to set another goal or to dream a new dream. --C.S. Lewis",
                "Try to be a rainbow in someone else's cloud. --Maya Angelou",
                "You do not find the happy life. You make it. --Camilla Eyring Kimball",
                "Inspiration comes from within yourself. One has to be positive. When you're positive, good things happen. --Deep Roy",
                "Sometimes you will never know the value of a moment, until it becomes a memory. --Dr. Seuss",
                "The most wasted of days is one without laughter. --E. E. Cummings",
                "You must do the things you think you cannot do. --Eleanor Roosevelt",
                "It isn't where you came from. It's where you're going that counts. --Ella Fitzgerald",
                "It is never too late to be what you might have been. --George Eliot",
                "Stay close to anything that makes you glad you are alive. --Hafez",
                "You get what you give. --Jennifer Lopez",
                "Some people look for a beautiful place. Others make a place beautiful. --Hazrat Inayat Khan",
                "Happiness often sneaks in through a door you didn't know you left open. --John Barrymore",
                "We must be willing to let go of the life we planned so as to have the life that is waiting for us. --Joseph Campbell",
                "Happiness is not by chance, but by choice. --Jim Rohn",
                "Life changes very quickly, in a very positive way, if you let it. --Lindsey Vonn",
                "Keep your face to the sunshine and you cannot see a shadow. --Helen Keller",
                "Never limit yourself because of others’ limited imagination; never limit others because of your own limited imagination. --Mae Jemison",
                "Be the change that you wish to see in the world. --Mahatma Gandhi",
                "Let us make our future now, and let us make our dreams tomorrow's reality. --Malala Yousafzai",
                "You don't always need a plan. Sometimes you just need to breathe, trust, let go, and see what happens. --Mandy Hale",
                "If I cannot do great things, I can do small things in a great way. --Martin Luther King Jr.",
                "My mission in life is not merely to survive, but to thrive. --Maya Angelou",
                "You are enough just as you are. --Meghan Markle",
                "The bad news is time flies. The good news is you're the pilot. --Michael Altshuler",
                "Spread love everywhere you go. --Mother Teresa",
                "Don't wait. The time will never be just right. --Napoleon Hill",
                "Life has got all those twists and turns. You've got to hold on tight and off you go. --Nicole Kidman",
                "If you look at what you have in life, you'll always have more. --Oprah Winfrey",
                "Inspiration is some mysterious blessing which happens when the wheels are turning smoothly. --Quentin Blake",
                "With the right kind of coaching and determination you can accomplish anything. --Reese Witherspoon",
                "If you have good thoughts they will shine out of your face like sunbeams and you will always look lovely. --Roald Dahl",
                "No matter what people tell you, words and ideas can change the world. --Robin Williams",
                "Each person must live their life as a model for others. --Rosa Parks​",
                "A champion is defined not by their wins but by how they can recover when they fall. --Serena Williams",
                "Motivation comes from working on things we care about. --Sheryl Sandberg",
                "Keep your face always toward the sunshine, and shadows will fall behind you. --Walt Whitman",
            ];

        let embed = new MessageEmbed()
            .setColor("#0efefe")
            .setTitle(`Here's some insipration/encouragement`)
            .setTimestamp()
            .setDescription(`${inspirationalMessages[Math.floor((Math.random() * 10))]}`);

        return message.reply(embed).then(m => del(m, 30000));
    }
}