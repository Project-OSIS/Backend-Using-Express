import { Router } from 'express'
import { getAllUsers,getUserById,createUser,updateUser,deleteUser } from '../../controller/userManagement/userManagementController'
import { checkJwt } from '../../utils/checkJwt'

const router = Router()

router.get('/get-user', [checkJwt ,getAllUsers])
router.get('/get-user/id', [checkJwt ,getUserById])
router.post('/create-user', createUser)
router.post('/update-user/id', updateUser)
router.post('/delete-user/id', deleteUser)



export default router
