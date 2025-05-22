import { getLocationChannelId } from '../services/locationService';
import { Bot } from './bot';
import { TextChannel, EmbedBuilder } from 'discord.js';

type timeslotMessageArgs = {
  locationId: string;
  startTime: string;
  endTime: string;
  date: string;
}

const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export const sendNewTimeslotMessage = async ({locationId, startTime, endTime, date}: timeslotMessageArgs) => {
  const channelId = await getLocationChannelId(locationId);
  if (!channelId) {
    throw new Error(`Location with ID ${locationId} not found`);
  }

  const channel = await Bot.guild.channels.fetch(channelId) as TextChannel;
  if (!channel) {
    throw new Error(`Channel with ID ${channelId} not found`);
  }

  const formattedStartTime = convertTo12Hour(startTime);

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🎾 New Court Timeslot Available!')
    .setDescription('If you can see this message, the court is still available for booking!')
    .addFields(
      { name: '📅 Date', value: date, inline: true },
      { name: '⏰ Start Time', value: formattedStartTime, inline: true },
      { name: '🔗 Book Here', value: `[Click to book on rec.us](https://www.rec.us/locations/${locationId})`, inline: true }
    )
    .setFooter({ text: 'Book fast!' })
    .setTimestamp();

  const message = await channel.send({ embeds: [embed] });
  return message.id;
}

export const updateTimeslotMessageToUnavailable = async (
  messageId: string, 
  channelId: string, 
  availableAt: Date, 
  unavailableAt: Date,
  date: string,
  startTime: string
) => {
  const channel = await Bot.guild.channels.fetch(channelId) as TextChannel;
  if (!channel) {
    throw new Error(`Channel with ID ${channelId} not found`);
  }

  const message = await channel.messages.fetch(messageId);
  if (!message) {
    throw new Error(`Message with ID ${messageId} not found`);
  }

  const duration = Math.round((unavailableAt.getTime() - availableAt.getTime()) / (1000 * 60)); // Duration in minutes
  const formattedStartTime = convertTo12Hour(startTime);

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('❌ Court Timeslot No Longer Available')
    .setDescription('This court has been booked by someone else.')
    .addFields(
      { name: '📅 Date', value: date, inline: true },
      { name: '⏰ Start Time', value: formattedStartTime, inline: true },
      { name: '⏱️ Duration Available', value: `${duration} minutes`, inline: true },
      { name: '📅 Booked At', value: unavailableAt.toLocaleString(), inline: true }
    )
    .setFooter({ text: 'Keep checking for new timeslots!' })
    .setTimestamp();

  await message.edit({ embeds: [embed] });
}
