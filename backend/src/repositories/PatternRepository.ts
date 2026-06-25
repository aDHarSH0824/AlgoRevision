import { Pattern, IPattern } from "../models/Pattern";

export class PatternRepository {
  async findByUserId(userId: string): Promise<IPattern[]> {
    return Pattern.find({ userId }).sort({ name: 1 });
  }

  async findById(id: string): Promise<IPattern | null> {
    return Pattern.findById(id);
  }

  async findByNameAndUserId(name: string, userId: string): Promise<IPattern | null> {
    return Pattern.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") }, userId });
  }

  async create(patternData: Partial<IPattern>): Promise<IPattern> {
    const pattern = new Pattern(patternData);
    return pattern.save();
  }

  async update(id: string, userId: string, patternData: Partial<IPattern>): Promise<IPattern | null> {
    return Pattern.findOneAndUpdate({ _id: id, userId }, patternData, { new: true });
  }

  async delete(id: string, userId: string): Promise<IPattern | null> {
    return Pattern.findOneAndDelete({ _id: id, userId });
  }
}
