
export const Alert = ({ mensaje = '', codigo = 200 }) => {
    return (
        <>
            {
                (codigo !== 200) ?
                    <div className="animate__animated animate__shakeX text-center alert alert-danger d-flex align-items-center" role="alert">
                        <div>
                            {mensaje}
                        </div>
                        <span ></span>
                    </div>
                    :
                    <div></div>
            }
        </>
    )
}
