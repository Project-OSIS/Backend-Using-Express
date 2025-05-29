import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import { getOrganizationStructure,createOrganizationStructure } from '../../controller/strcutureAnggota/structureAnggotaController'

const router = Router()

router.get('/get-structure', [checkJwt ,getOrganizationStructure])
router.post('/create-structure', [checkJwt ,createOrganizationStructure])


export default router
