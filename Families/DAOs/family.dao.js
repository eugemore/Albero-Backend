import { ObjectId } from "mongodb";

let families;

export default class FamilyDAO {
	static async injectDB(conn) {
		if (families) {
			return
		}
		try {
			families = await conn.db(process.env.ALBERO_NS).collection("subjects");
		} catch (err) {
			console.error(`unable to establish a collection handle in FamilyDAO: ${e}`)
		}
	}

	static async getAllFamilies() {
		let cursor

		try {
			cursor = await families.find();
		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return { restaurantList: [], totalNumRestaurants: 0 };
		}

		try {
			const resultingFamilies = await cursor.toArray();
			return resultingFamilies
		} catch (err) {
			console.error(`Unable to convert cursor to array or at counting documents, ${err}`);
			return [];
		}
	}

	static async getFamilyById(id) {
		let family;
		try {
			family = await families.findOne({ "_id": ObjectId(id) }, { "password": 0 });
			return family;

		} catch (err) {
			console.error(`Unable to issue find by Id command , ${err}`);
			return {};
		}
	}

	static async getMembersById(id) {
		let members;
		try {
			members = await families.findOne({ "_id": ObjectId(id) },{ "members": 1 });
			return members.members;

		} catch (err) {
			console.error(`Unable to issue find by Id command , ${err}`);
			return {};
		}
	}

	static async createFamily(user) {
		const family = {
			email: user.email,
			password: user.password,
			createdAt: new Date(),
			phone: "",
			codiceFiscale: "",
			passport: "",
			ueArrival: "",
			residenciaDate: "",
			members: []
		}
		try{
			return await families.insertOne(family);
		}catch(err){
			console.log(`Unable to create document at Family collection: ${err}`)
			return {}
		}
	}

	static async updateFamilyMember(familyId, member) {
		let update = {};

		if (member.birth_date) {
			update["members.$.birth_date"] = member.birth_date;
		}
		if (member.gender) {
			update["members.$.gender"] = member.gender;
		}
		if (member.firstName) {
			update["members.$.firstName"] = member.firstName;
		}
		if (member.middleNames != undefined || member.middleNames != null) {
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
		if (member["alive"] != null) {
			update["members.$.alive"] = member.alive;
		}

		let updatedFamily;
		try {
			updatedFamily = await families.updateOne({
				"_id": ObjectId(familyId),
				"members._id": ObjectId(member._id)
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

	static async addFamilyMember(familyId, member) {
		member._id = new ObjectId();
		try {
			const addedMember = await families.updateOne({
				"_id": ObjectId(familyId),
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


	//HAY QUE TERMINAR
	static async deleteFamilyMember(familyId, memberId) {
		try {
			const addedMember = await families.updateOne({
				"_id": ObjectId(familyId),
			},
				{
					$pull: {
						members: { "$._id": ObjectId(memberId) }
					}
				});
			return addedMember;

		} catch (err) {
			console.error(`Unable to issue find command , ${err}`);
			return {};
		}
	}
}