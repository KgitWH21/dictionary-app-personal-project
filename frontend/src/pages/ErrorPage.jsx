import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

const ErrorPage = () => {
    //useRouteError access the error thrown from a loader
    const error = useRouteError()
    console.error(error)

    let msg = 'Something went wrong'

    //this distinguishes routing responses from normal JS errors
    if (isRouteErrorResponse(error)) {
        msg = `${error.status} - ${error.statusText}`
    } else if (error instanceof Error) {
        msg = error.message
    }

    return (
        <div className="mx-auto max-w-sm p-6">
            <h1>Oh no..</h1>
            <p>{msg}</p>
            <Link to="/">Back to login</Link>
        </div>
    )
}

export default ErrorPage
