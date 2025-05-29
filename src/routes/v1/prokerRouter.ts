import { Router } from 'express'
import { getAllProkers, getProkerById,createProker,updateProker,deleteProker } from '../../controller/prokerManagement/prokerManagmentController'
import { checkJwt } from '../../utils/checkJwt'

const router = Router()

router.get('/get-proker', [checkJwt ,getAllProkers])
router.get('/get-proker/id', [checkJwt ,getProkerById])
router.post('/create-proker', [checkJwt ,createProker])
router.post('/update-proker/id', [checkJwt ,updateProker])
router.post('/delete-proker/id', deleteProker)



export default router
