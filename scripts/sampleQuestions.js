/**
 * Sample Questions Data
 * 
 * This file contains sample questions to seed into Firestore.
 * Use the seed script to upload these to your database.
 * 
 * Each question has:
 * - questionText: The question content
 * - options: Array of 4 options (A, B, C, D)
 * - correctAnswer: Index of correct option (0-3)
 * - timeLimit: Time in seconds (default 30)
 * - marks: Points for correct answer (default 1)
 * - order: Display order before randomization
 */
const sampleQuestions = [
  {
    questionText: "A set of rules that govern data communication is called ________.",
    options: ["Protocol", "Medium", "Topology", "Transmission"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 1
  },
  {
    questionText: "The physical path over which a message travels in a communication system is the ________.",
    options: ["Protocol", "Medium", "Signal", "Message"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 2
  },
  {
    questionText: "What is the term for the information to be communicated in a data communications system?",
    options: ["Data", "Protocol", "Message", "Signal"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 3
  },
  {
    questionText: "In a _______ connection, more than two devices can share a single link.",
    options: ["Point-to-point", "Multipoint", "Primary", "Secondary"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 4
  },
  {
    questionText: "Which network covers a large geographical area, such as a country or continent?",
    options: ["LAN (Local Area Network)", "MAN (Metropolitan Area Network)", "WAN (Wide Area Network)", "PAN (Personal Area Network)"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 5
  },
  {
    questionText: "MAN stands for ________.",
    options: ["Main Area Network", "Metropolitan Area Network", "Memory Area Network", "Multiple Access Network"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 6
  },
  {
    questionText: "Communication between a computer and a keyboard involves ________ transmission.",
    options: ["Full-duplex", "Half-duplex", "Simplex", "Automatic"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 7
  },
  {
    questionText: "A television broadcast is an example of _______ transmission.",
    options: ["Half-duplex", "Full-duplex", "Simplex", "Automatic"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 8
  },
  {
    questionText: "Which topology requires a central controller or hub?",
    options: ["Mesh", "Bus", "Ring", "Star"],
    correctAnswer: 3,
    timeLimit: 30,
    marks: 1,
    order: 9
  },
  {
    questionText: "In which topology are all the nodes connected through a single coaxial cable?",
    options: ["Star", "Tree", "Bus", "Ring"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 10
  },
  {
    questionText: "A cable break in a _______ topology stops all transmission.",
    options: ["Star", "Mesh", "Bus", "Primary"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 11
  },
  {
    questionText: "In a network with 25 computers, which topology would require the most extensive cabling?",
    options: ["Star", "Mesh", "Bus", "Ring"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 12
  },
  {
    questionText: "Which topology requires a multipoint connection?",
    options: ["Mesh", "Star", "Ring", "Bus"],
    correctAnswer: 3,
    timeLimit: 30,
    marks: 1,
    order: 13
  },
  {
    questionText: "Which of the following is not an example of unguided media?",
    options: ["Radio wave", "Bluetooth", "Optical Fibre Cable", "Satellite"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 14
  },
  {
    questionText: "A major advantage of fiber-optic transmission is its ________.",
    options: ["Low cost", "Ease of installation", "High bandwidth", "Sensitivity"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 15
  },
  {
    questionText: "Which of these is a voiceband channel commonly used for communication?",
    options: ["Coaxial cable", "Microwave systems", "Telephone line", "Satellite link"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 16
  },
  {
    questionText: "The process of converting digital signals into analog form is called ________.",
    options: ["Amplification", "Modulation", "Demodulation", "Digitization"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 17
  },
  {
    questionText: "Which of the following is not a layer in the OSI reference model?",
    options: ["Application", "Media Access", "Session", "Presentation"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 18
  },
  {
    questionText: "The end-to-end delivery of the entire message is the primary responsibility of the _____ layer.",
    options: ["Network", "Transport", "Session", "Presentation"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 19
  },
  {
    questionText: "Which layer of the OSI model is responsible for creating and recognizing frame boundaries?",
    options: ["Physical layer", "Data link layer", "Network layer", "Transport layer"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 20
  },
  {
    questionText: "The Internet's protocol suite is known as ________.",
    options: ["ISO", "OSI", "TCP/IP", "X.25"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 21
  },
  {
    questionText: "Identify the class of IP address 4.5.6.7.",
    options: ["Class A", "Class B", "Class C", "Class D"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 22
  },
  {
    questionText: "Each IP packet must contain:",
    options: ["Only Source address", "Only Destination address", "Source and Destination address", "Source or Destination address"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 23
  },
  {
    questionText: "A diskless machine uses which protocol to obtain its IP address from a server?",
    options: ["RARP", "RIP", "RDP", "X.25"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 24
  },
  {
    questionText: "Which protocol is used for the transfer of hypertext content over the web?",
    options: ["HTML", "HTTP", "TCP/IP", "FTP"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 25
  },
  {
    questionText: "Which of the following is an application layer protocol used in TCP/IP to map domain names to IP addresses?",
    options: ["FTP", "DNS", "SNMP", "SMTP"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 26
  },
  {
    questionText: "The TCP/IP protocol for networking was developed by which organization?",
    options: ["IBM", "DEC", "DARPA", "NOVELL"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 27
  },
  {
    questionText: "The device that determines the most efficient path to transmit messages in a network is a ________.",
    options: ["Gateway", "Router", "Bridge", "Repeater"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 28
  },
  {
    questionText: "What is the use of a Bridge in a network?",
    options: ["To connect LANs", "To separate LANs", "To control network speed", "All of the above"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 29
  },
  {
    questionText: "What is a firewall in a computer network?",
    options: ["The physical boundary of a network", "An operating system of a computer network", "A system designed to prevent unauthorized access", "A web browsing software"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 30
  },
  {
    questionText: "A device that can be connected to a network without using a cable is called a ________.",
    options: ["Distributed device", "Centralized device", "Open-source device", "Wireless device"],
    correctAnswer: 3,
    timeLimit: 30,
    marks: 1,
    order: 31
  },
  {
    questionText: "Which of the following is an example of a Personal Area Network (PAN) technology?",
    options: ["Ethernet", "Token Ring", "Bluetooth", "FDDI"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 32
  },
  {
    questionText: "In _______ transmission, the channel capacity is shared by both communicating devices at all times.",
    options: ["Full-duplex", "Simplex", "Half-duplex", "Half-simplex"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 33
  },
  {
    questionText: "Which switching method facilitates a dedicated communication channel between two stations?",
    options: ["Circuit switching", "Packet switching", "Message switching", "Virtual switching"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 34
  },
  {
    questionText: "In which switching approach do all packets of a message follow the same path from sender to receiver?",
    options: ["Circuit switching", "The virtual circuit approach to packet switching", "Message switching", "The datagram approach to packet switching"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 35
  },
  {
    questionText: "Which multiplexing method divides the time domain into slots and allocates them to different signals?",
    options: ["FDM (Frequency Division Multiplexing)", "TDM (Time Division Multiplexing)", "WDM (Wavelength Division Multiplexing)", "CDM (Code Division Multiplexing)"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 36
  },
  {
    questionText: "Which layer of the OSI model is responsible for end-to-end communication and error recovery?",
    options: ["Transport Layer", "Network Layer", "Data Link Layer", "Session Layer"],
    correctAnswer: 0,
    timeLimit: 30,
    marks: 1,
    order: 37
  },
  {
    questionText: "In the OSI model, which layer handles IP addressing and routing?",
    options: ["Application Layer", "Network Layer", "Physical Layer", "Presentation Layer"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 38
  },
  {
    questionText: "Which OSI layer ensures data is in a readable format for the application?",
    options: ["Session Layer", "Presentation Layer", "Transport Layer", "Data Link Layer"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 39
  },
  {
    questionText: "The physical transmission of bits across a medium is handled by:",
    options: ["Data Link Layer", "Physical Layer", "Network Layer", "Transport Layer"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 40
  },
  {
    questionText: "Which device operates at Layer 2 of the OSI model?",
    options: ["Router", "Switch", "Hub", "Firewall"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 41
  },
  {
    questionText: "Which networking device is used to connect different networks and operates at Layer 3?",
    options: ["Switch", "Router", "Hub", "Repeater"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 42
  },
  {
    questionText: "A hub transmits data to:",
    options: ["Only the intended recipient", "All devices connected to it", "Devices in a specific VLAN", "Devices based on IP address"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 43
  },
  {
    questionText: "Which device is primarily used to extend the range of a network signal?",
    options: ["Router", "Switch", "Repeater", "Firewall"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 44
  },
  {
    questionText: "Which of the following is not a guided transmission medium?",
    options: ["Twisted Pair Cable", "Coaxial Cable", "Fiber Optic Cable", "Radio Waves"],
    correctAnswer: 3,
    timeLimit: 30,
    marks: 1,
    order: 45
  },
  {
    questionText: "Fiber optic cables transmit data using:",
    options: ["Electrical signals", "Light signals", "Radio signals", "Magnetic signals"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 46
  },
  {
    questionText: "Which transmission medium is most susceptible to electromagnetic interference (EMI)?",
    options: ["Fiber Optic Cable", "Coaxial Cable", "Twisted Pair Cable", "Satellite Link"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 47
  },
  {
    questionText: "Which medium provides the highest bandwidth among the following?",
    options: ["Twisted Pair", "Coaxial Cable", "Fiber Optic", "Microwave"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 48
  },
  {
    questionText: "In a star topology, all devices are connected to:",
    options: ["Each other directly", "A central hub or switch", "A backbone cable", "A router only"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 49
  },
  {
    questionText: "Which network architecture is most fault-tolerant but also most expensive?",
    options: ["Bus Topology", "Ring Topology", "Mesh Topology", "Star Topology"],
    correctAnswer: 2,
    timeLimit: 30,
    marks: 1,
    order: 50
  },
  {
    questionText: "In a bus topology, if the main cable fails:",
    options: ["Only one device is affected", "The entire network goes down", "Devices reroute automatically", "Only the router stops working"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 51
  },
  {
    questionText: "Which architecture is commonly used in LANs for scalability and easy troubleshooting?",
    options: ["Ring", "Star", "Bus", "Mesh"],
    correctAnswer: 1,
    timeLimit: 30,
    marks: 1,
    order: 52
  }
];

module.exports = sampleQuestions;