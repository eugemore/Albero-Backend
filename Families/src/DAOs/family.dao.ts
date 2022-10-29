import { ObjectId, Collection, MongoClient } from "mongodb";

let families: Collection;

export default class FamilyDAO {
	static async injectDB(conn: MongoClient) {
		if (families) {
			return
		}
		try {
			families = await conn.db(process.env.ALBERO_NS).collection("subjects");
		} catch (err) {
			console.error(`unable to establish a collection handle in FamilyDAO: ${err}`)
		}
	}

	static async getAllFamilies() {
		let cursor

		try {
			cursor = await families.find();
		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return null;
		}

		try {
			const resultingFamilies = await cursor.toArray();
			return resultingFamilies
		} catch (err) {
			console.error(`Unable to convert cursor to array or at counting documents, ${err}`);
			return [];
		}
	}

	static async getFamilyById(id: string) {
		let family;
		try {
			family = await families.findOne({ "_id": new ObjectId(id) }, { projection: { "password": 0 } });
			return family;

		} catch (err) {
			console.error(`Unable to issue find by Id command , ${err}`);
			return {};
		}
	}

	static async getMembersById(id: string) {
		let members;
		try {
			members = await families.findOne({ "_id": new ObjectId(id) }, { projection: { "members": 1 } });
			return members.members;

		} catch (err) {
			console.error(`Unable to issue find by Id command , ${err}`);
			return {};
		}
	}

	static async createFamily(user: any) {
		const family = {
			email: user.email,
			password: user.password,
			createdAt: new Date(),
			phone: "",
			codiceFiscale: "",
			passport: "",
			ueArrival: "",
			residenciaDate: "",
			members: new Array<any>()
		}
		try {
			return await families.insertOne(family);
		} catch (err) {
			console.log(`Unable to create document at Family collection: ${err}`)
			return {}
		}
	}

	static async updateFamilyMember(familyId: string, member: any) {
		const update: any = {};

		if (member.birth_date) {
			update["members.$.birth_date"] = member.birth_date;
		}
		if (member.gender) {
			update["members.$.gender"] = member.gender;
		}
		if (member.firstName) {
			update["members.$.firstName"] = member.firstName;
		}
		if (member.middleNames !== undefined || member.middleNames !== null) {
			update["members.$.middleNames"] = member.middleNames;
		}
		if (member.lastName) {
			update["members.$.lastName"] = member.lastName;
		}
		if (member.nationality) {
			update["members.$.nationality"] = member.nationality;
		}
		if (member.status) {
			update["members.$.status"] = member.status;
		}
		if (member.alive != null) {
			update["members.$.alive"] = member.alive;
		}

		let updatedFamily;
		try {
			updatedFamily = await families.updateOne({
				"_id": new ObjectId(familyId),
				"members._id": new ObjectId(member._id)
			},
				{
					$set: update
				});
			return updatedFamily;

		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return {};
		}
	}

	static async addFamilyMember(familyId: string, member: any) {
		member._id = new ObjectId();
		try {
			const addedMember = await families.updateOne({
				"_id": new ObjectId(familyId),
			},
				{
					$push: {
						members: member
					}
				});
			return addedMember;

		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return {};
		}
	}


	// HAY QUE TERMINAR
	static async deleteFamilyMember(familyId: string, memberId: string) {
		try {
			const addedMember = await families.updateOne({
				"_id": new ObjectId(familyId),
			},
				{
					$pull: {
						members: { "$._id": new ObjectId(memberId) }
					}
				});
			return addedMember;

		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return {};
		}
	}
}