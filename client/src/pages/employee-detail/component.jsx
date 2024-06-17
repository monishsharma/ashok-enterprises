import {useEffect, useState} from 'react'
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import PageLoader from "../../shared/component/page-loader"
import {Container, Row} from "react-bootstrap";

const EmployeeDetail = ({
    detail,
    employeeDetailConnect
}) => {

    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
      if (id) {
        setIsLoading(true);
        employeeDetailConnect(id)
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false))
      }

    }, [id])

    if (isLoading) return <PageLoader />

    return (
      <div>
        <Container>
          <Row>
          </Row>
        </Container>
      </div>
    )
}

EmployeeDetail.propTypes = {
  employeeDetailConnect: PropTypes.func
}

export default EmployeeDetail