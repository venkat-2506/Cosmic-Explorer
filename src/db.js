import Dexie from 'dexie';

export const db = new Dexie('CosmicExplorerDB');

// Initial schema
db.version(1).stores({
  missions: '++id, name, timestamp',
});

// Upgrade to version 2 to add chatHistory
db.version(2).stores({
  missions: '++id, name, timestamp',
  chatHistory: '++id, timestamp', // `messages` will be part of the record
});


/**
 * Saves a mission analysis to the database.
 * @param {string} name - The name of the mission.
 * @param {object} data - The mission result data.
 */
export async function saveMission(name, data) {
  try {
    const missionRecord = {
      name,
      data,
      timestamp: new Date().toISOString(),
    };
    await db.missions.add(missionRecord);
    console.log(`Mission "${name}" saved successfully.`);
  } catch (error) {
    console.error("Failed to save mission:", error);
  }
}

/**
 * Retrieves all missions from the database, sorted by most recent first.
 * @returns {Promise<Array>} A promise that resolves to an array of all missions.
 */
export async function getAllMissions() {
  try {
    return await db.missions.orderBy('timestamp').reverse().toArray();
  } catch (error)
{
    console.error("Failed to get all missions:", error);
    return [];
  }
}

/**
 * Saves a chat session to the database. Overwrites any existing session.
 * @param {Array<object>} messages - The array of message objects.
 */
export async function saveChat(messages) {
  try {
    // For simplicity, we'll only store one chat history.
    // Clear the existing history and add the new one.
    await db.chatHistory.clear();
    await db.chatHistory.add({
      messages,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to save chat:", error);
  }
}

/**
 * Retrieves the most recent chat session from the database.
 * @returns {Promise<object|null>} A promise that resolves to the latest chat object or null.
 */
export async function getLatestChat() {
  try {
    const history = await db.chatHistory.orderBy('timestamp').reverse().first();
    return history;
  } catch (error) {
    console.error("Failed to get latest chat:", error);
    return null;
  }
}
