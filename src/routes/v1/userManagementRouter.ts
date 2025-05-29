import { Router } from 'express'
import { getAllUsers,getUserById,createUser,updateUser,deleteUser,upload } from '../../controller/userManagement/userManagementController'
import { userSeeder } from '../../controller/seeder/userSeeder'
import { checkJwt } from '../../utils/checkJwt'

const router = Router()

router.get('/user-seed', userSeeder)
router.get('/get-user', [checkJwt ,getAllUsers])
router.get('/get-user/:id', [checkJwt ,getUserById])
router.post('/create-user',upload.single('image'), [checkJwt ,createUser])
router.put('/update-user/:id',upload.single('image'), [checkJwt ,updateUser])
router.post('/delete-user/:id', deleteUser)



export default router
