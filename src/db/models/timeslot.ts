import mongoose, { Schema, Document, model } from 'mongoose';

interface IMessageInfo {
    messageId: string;
    server: string;
}

export interface ITimeslot extends Document {
    _id: string;
    startTime: string;
    endTime: string;
    date: string;
    locationId: string;
    locationName: string;
    available: boolean;
    messages: IMessageInfo[];
}

const TimeslotSchema = new Schema<ITimeslot>({
    _id: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    date: { type: String, required: true },
    locationId: { type: String, required: true },
    locationName: { type: String, required: true },
    available: { type: Boolean, required: true, default: true },
    messages: [{
        messageId: { type: String, required: true },
        server: { type: String, required: true }
    }]
});

const Timeslot = model<ITimeslot>('Timeslot', TimeslotSchema);

export default Timeslot;