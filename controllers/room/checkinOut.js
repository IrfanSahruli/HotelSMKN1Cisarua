const ArrivalGroup = require("../../models/room/arrival");
const DepartureGroup = require("../../models/room/departure");
const CheckinOut = require("../../models/room/inOut");
const Makanan = require("../../models/room/other");
const Other = require("../../models/room/other");
const Remarks = require("../../models/room/remarks");
const Reservasi = require("../../models/room/reservasi");
const ReservasiGroup = require("../../models/room/reservasiG");
const Room = require("../../models/room/room");
const RoomG = require("../../models/room/roomG");
const User = require("../../models/User/users");
const moment = require("moment");

const RegistrasiPersonal = async (req, res) => {
    const {
        id_reservasi,
        id_reservasi_group,
        fullname,
        title,
        address,
        postal,
        id_number,
        itype,
        email,
        phone,
        subtotal,
        deposit,
        total,
        paymentmethod,
        cardNo,
        cvv,
        exp,
        front_desk,
        remarks,
        formStatusGP
    } = req.body;
    const id = req.user.id
    try {
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }

        if (!id_reservasi && !id_reservasi_group) {
            return res.status(400).json({ message: 'Either id_reservasi or id_reservasi_group must be provided' });
        }

        if (id_reservasi) {
            const idReservasi = await Reservasi.findByPk(id_reservasi);
            if (!idReservasi) {
                return res.status(400).json({ message: 'reservasi data not found' });
            }
            if (idReservasi.status === 'in') {
                return res.status(400).json({ message: 'Unable to make a reservation. Reservasi status is already "in".' });
            }
        }

        if (id_reservasi_group) {
            const idReservassiGroup = await ReservasiGroup.findByPk(id_reservasi_group);
            if (!idReservassiGroup) {
                return res.status(400).json({ message: 'reservasi group data not found' });
            }
            if (idReservassiGroup.status === 'in') {
                return res.status(400).json({ message: 'Unable to make a reservation. Reservasi group status is already "in".' });
            }
        }


        const formatExp = moment(exp, "DD-MM-YYYY").format("YYYY-MM-DD");

        const inCheck = await CheckinOut.create({
            userIn : user.username,
            id_reservasi,
            id_reservasi_group,
            fullname,
            title,
            address,
            postal,
            id_number,
            itype,
            email,
            phone,
            subtotal,
            deposit,
            total,
            paymentmethod,
            cardNo,
            cvv,
            exp : formatExp,
            front_desk,
            formStatusGP
        })

        if (remarks) {
            for (let index = 0; index < remarks.length; index++) {
                const { detail } = remarks[index];
                await Remarks.create({
                    id_registrasi: inCheck.id,
                    detail,
                });
            }
        }

    if (id_reservasi) {
       await Reservasi.update(
        { status: 'in' },
        { where: { id: id_reservasi } }
      );
    }

    if (id_reservasi_group) {
        await ReservasiGroup.update(
            { status: 'in' },
            { where: { id: id_reservasi_group } }
        );
    }


         res.status(200).json(inCheck);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const getOneForm = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await Reservasi.findOne({
            where: { id: id }, 
        })
         res.status(200).json(form);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const getReservasi = async (req, res) => {
    try {
        const reservasi = await Reservasi.findAll({
            where: { status: 'reservasi' }
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getReservasiRegistrasi = async (req, res) => {
    try {
        const reservasi = await Reservasi.findAll({
            where: { status: 'in'},
            include: [{
                model: CheckinOut,
                include: [{
                    model : Remarks
                }]
            }]
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// const getOneFormRegis = async (req, res) => {
//     const id = req.params.id;
//     try {
//         const form = await RegistrasiPersonal.findOne({
//             where: { id: id }, 
//         })
//          res.status(200).json(form);
//     } catch (error) {
//          res.status(500).json({ message: error.message });
//     }
// }

// const getRegistrasi = async (req, res) => {
//     try {
//         const reservasi = await Re.findAll({
//             where : {status : 'reservasi'}
//         })
//         res.status(200).json(reservasi);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

const getCheckin = async (req, res) => {
    try {
        const checkin = await Reservasi.findAll({
            where: { status: 'in' },
            // attributes : ['name', 'checkin', 'checkout', 'roomNo'],
            include: [{
                model : CheckinOut
            }]
        })
         res.status(200).json(checkin);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const getCheckout = async (req, res) => {
    try {
        const checkout = await Reservasi.findAll({
            where : {status : 'out'}
        })
         res.status(200).json(checkout);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const Total = async (req, res) => {
    try {
        const total = await CheckinOut.sum('total', {
             where : { formStatus : 'checkout'}
        })

         const checkout = await Reservasi.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: CheckinOut,
                    attributes: ['total']
                },
            ]
         });

         const checkoutGroup = await ReservasiGroup.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: CheckinOut,
                    attributes: ['total']
                },
                {
                   model: ArrivalGroup,
                    attributes: ['datee']
                },
                 {
                    model: DepartureGroup,
                    attributes: ['datee']
                }
            ]
        });

        res.status(200).json({total, checkout, checkoutGroup});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const TotalGroup = async (req, res) => {
    try {
        const total = await CheckinOut.sum('total', {
             where : { formStatus : 'checkout', formStatusGP : 'Group'}
        })

         const checkout = await ReservasiGroup.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: CheckinOut,
                    attributes: ['total']
                },
                {
                   model: ArrivalGroup,
                    attributes: ['datee']
                },
                 {
                    model: DepartureGroup,
                    attributes: ['datee']
                }
            ]
        });

        res.status(200).json({total, checkout});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const hapusRservasi = async (req, res) => {
  const { id } = req.params;
  try {
    const reservasi = await Reservasi.findByPk(id)
    if (!reservasi) {
      return res.status(404).json({ message: "Reservasi is not found" });
    }
    await Reservasi.destroy({ where: { id: id } })
    res.status(200).json({ message: 'sukses' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const readyToCheckout = async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    try {
      
    const reservasi = await Reservasi.findByPk(id)
    if (!reservasi) {
      return res.status(404).json({ message: "Reservasi is not found" });
        }
        
    const idUser = await User.findByPk(userid)
    if (!idUser) {
      return res.status(404).json({ message: "user is not found" });
      }
    
        await Reservasi.update({ status: 'out' }, { where: { id: id } })
        await CheckinOut.update({ formStatus: 'checkout', userOut : idUser.username }, { where: { id_reservasi: id } })

    res.status(200).json({ message: 'sukses' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const readyToCheckoutGroup = async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    try {
      
    const reservasi = await ReservasiGroup.findByPk(id)
    if (!reservasi) {
      return res.status(404).json({ message: "Reservasi is not found" });
        }
        
     const idUser = await User.findByPk(userid)
    if (!idUser) {
      return res.status(404).json({ message: "user is not found" });
      }
    
        await ReservasiGroup.update({ status: 'out',  }, { where: { id: id } })
        await CheckinOut.update({ formStatus: 'checkout', userOut : idUser.username }, { where: { id_reservasi_group: id } })

    res.status(200).json({ message: 'sukses' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getReservasiGroup = async (req, res) => {
        try {
            const reservasi = await ReservasiGroup.findAll({
                // where: { status: 'in' },
                include: [
                    {
                        model : Remarks
                    },
                    {
                        model : ArrivalGroup
                    },
                    {
                        model : DepartureGroup
                    },
                    {
                        model : Makanan
                    }, 
                    {
                        model : RoomG
                    }
                ]
            })
         res.status(200).json(reservasi)
        } catch (error) {
        res.status(500).json({ message: error.message })
        }
}

const getReservasiGroupIn = async (req, res) => {
        try {
            const reservasi = await ReservasiGroup.findAll({
                where: { status: 'in' },
                include: [
                    {
                        model : Remarks
                    },
                    {
                        model : ArrivalGroup
                    },
                    {
                        model : DepartureGroup
                    },
                    {
                        model : Makanan
                    }, 
                    {
                        model : RoomG
                    },
                    {
                        model : CheckinOut
                    }
                ]
            })
         res.status(200).json(reservasi)
        } catch (error) {
        res.status(500).json({ message: error.message })
        }
}

const getReservasiGroupOut = async (req, res) => {
        try {
            const reservasi = await ReservasiGroup.findAll({
                where: { status: 'out' },
                include: [
                    {
                        model : Remarks
                    },
                    {
                        model : ArrivalGroup
                    },
                    {
                        model : DepartureGroup
                    },
                    {
                        model : Makanan
                    }, 
                    {
                        model : RoomG
                    }
                ]
            })
         res.status(200).json(reservasi)
        } catch (error) {
        res.status(500).json({ message: error.message })
        }
}

const hapusReservasiGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const reservasi = await ReservasiGroup.findByPk(id)
            if (!reservasi) {
            return res.status(404).json({ message: "Reservasi is not found" });
            }
        await ReservasiGroup.destroy({ where: { id: id } })
        await Remarks.destroy({where: { id_reservasi: id }})
        await ArrivalGroup.destroy({where: { id_reservasi_group: id }})
        await DepartureGroup.destroy({where: { id_reservasi_group: id }})
        await Makanan.destroy({where: {id_reservasi_group : id}})
        await RoomG.destroy({where: {id_reservasi : id}})

        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getOneFormGroup = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await ReservasiGroup.findOne({
            where: { id: id },
             include: [
                    {
                        model : Remarks
                    },
                    {
                        model : ArrivalGroup
                    },
                    {
                        model : DepartureGroup
                    },
                    {
                        model : Makanan
                    }, 
                    {
                        model : RoomG
                    }
                ]
        })
         res.status(200).json(form);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}


module.exports = {
    RegistrasiPersonal,
    getOneForm,
    getCheckin,
    getCheckout,
    Total,
    getReservasi,
    getReservasiRegistrasi,
    hapusRservasi,
    readyToCheckout,
    getReservasiGroup,
    hapusReservasiGroup,
    getOneFormGroup,
    readyToCheckout,
    readyToCheckoutGroup,
    getReservasiGroupOut,
    TotalGroup,
    getReservasiGroupIn,
}